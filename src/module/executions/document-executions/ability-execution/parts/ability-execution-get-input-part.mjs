import { TeriockDialog } from "../../../../applications/api/_module.mjs";
import { placeTemplateDialog } from "../../../../applications/dialogs/_module.mjs";
import { TeriockTextEditor } from "../../../../applications/ux/_module.mjs";
import { AbilityTemplate } from "../../../../canvas/placeables/_module.mjs";
import { TemplateAutomation } from "../../../../data/pseudo-documents/automations/_module.mjs";
import { BaseRoll } from "../../../../dice/rolls/_module.mjs";
import { createDialogFieldset } from "../../../../helpers/html.mjs";
import { ucFirst } from "../../../../helpers/string.mjs";
import { makeIconClass } from "../../../../helpers/utils.mjs";

/**
 * @param {typeof AbilityExecutionConstructor} Base
 */
export default function AbilityExecutionGetInputPart(Base) {
  return (
    /**
     * @extends {AbilityExecutionConstructor}
     * @extends {BaseDocumentExecution}
     * @mixin
     */
    class AbilityExecutionGetInput extends Base {
      /** @inheritDoc */
      get icon() {
        return TERIOCK.display.icons.document.ability;
      }

      /** @inheritDoc */
      get name() {
        return this.source.system.fullName;
      }

      /**
       * @param {string} stat
       * @returns {Promise<number>}
       */
      async #determineCost(stat) {
        if (this.source.system.costs.primary[stat].type === "formula") {
          const roll = new BaseRoll(
            this.source.system.costs.primary[stat].formula,
            this.rollData,
          );
          await roll.evaluate();
          return roll.total;
        } else {
          return 0;
        }
      }

      /**
       * Apply constant adept/inept/gifted modifications to default costs.
       */
      #modifyCosts() {
        for (const [k, v] of Object.entries(TERIOCK.options.cost.tweaks)) {
          this.costs[v.primary] +=
            v.amount * this.source.system.costs.tweaks[k];
        }
      }

      /**
       * Whether the prompt for a given cost should be shown.
       * @param {string} stat
       * @returns {boolean}
       */
      #shouldShowCostPrompt(stat) {
        return (
          this.source.system.costs.primary[stat].type === "description" &&
          !this.options[`no${ucFirst(stat)}`]
        );
      }

      /**
       * Get user input on costs.
       * @returns {Promise<void>}
       */
      async _getCostInput() {
        const dialogs = [];
        for (const [k, v] of Object.entries(
          TERIOCK.options.cost.primary.keys,
        )) {
          if (this.#shouldShowCostPrompt(k)) {
            dialogs.push(
              createDialogFieldset(
                game.i18n.format("TERIOCK.COSTS.Long.primary", {
                  key: v.label,
                }),
                await TeriockTextEditor.enrichHTML(
                  this.source.system.costs.primary[k].description,
                ),
                k,
              ),
            );
          } else {
            this.costs[k] = await this.#determineCost(k);
          }
        }
        if (
          this.proficient &&
          this.source.system.heightened &&
          !this.flags.noHeighten
        ) {
          const heightenDescription = await TeriockTextEditor.enrichHTML(
            this.source.system.heightened,
            { relativeTo: this.source },
          );
          dialogs.push(
            createDialogFieldset(
              game.i18n.localize(
                "TERIOCK.SYSTEMS.Ability.DIALOG.VariableCosts.heightened",
              ),
              heightenDescription,
              "heightened",
              this.actor?.system.scaling.p || Infinity,
            ),
          );
        }
        if (dialogs.length > 0) {
          const title = this.source.system.spell
            ? game.i18n.format("TERIOCK.SYSTEMS.Ability.EXECUTION.casting", {
                name: this.source.name,
              })
            : game.i18n.format("TERIOCK.SYSTEMS.Ability.EXECUTION.executing", {
                name: this.source.name,
              });
          await TeriockDialog.prompt({
            window: {
              icon: makeIconClass(
                TERIOCK.display.icons.document.ability,
                "title",
              ),
              title: title,
            },
            content: dialogs.join(""),
            modal: true,
            ok: {
              label: game.i18n.localize(
                "TERIOCK.SYSTEMS.Ability.DIALOG.VariableCosts.ok",
              ),
              callback: (_event, button) => {
                for (const k of Object.keys(
                  TERIOCK.options.cost.primary.keys,
                )) {
                  if (this.#shouldShowCostPrompt(k)) {
                    this.costs[k] = Number(
                      button.form.elements.namedItem(k).value,
                    );
                  }
                }
                if (this.proficient && this.source.system.heightened) {
                  this.heightened = Number(
                    button.form.elements.namedItem("heightened").value,
                  );
                  this.costs.mp += this.heightened;
                }
              },
            },
          });
        }
        this.#modifyCosts();
      }

      /** @inheritDoc */
      async _getInput() {
        await super._getInput();
        await this._getCostInput();
        await this._getTargetInput();
      }

      /**
       * Determine targets and place templates.
       * @return {Promise<void>}
       */
      async _getTargetInput() {
        if (
          this.source.system.targets.size === 1 &&
          this.source.system.targets.has("self") &&
          this.executor
        ) {
          this.targets.add(this.executor);
        } else {
          for (const target of game.user.targets) {
            this.targets.add(target);
          }
        }
        const templateAutomation =
          /** @type {TemplateAutomation} */
          this.activeAutomations.find(
            (a) => a.type === TemplateAutomation.TYPE,
          );
        const noTemplate =
          this.flags.noTemplate ||
          !game.teriock.getSetting("placeTemplateOnAbilityUse") ||
          templateAutomation?.t === "none";
        const canTemplate = this.source.system.isAoe || !!templateAutomation;
        if (canTemplate && !noTemplate) {
          let t = "circle";
          if (this.source.system.expansion.type === "detonate") t = "circle";
          if (this.source.system.delivery === "cone") t = "cone";
          if (this.source.system.delivery === "aura") t = "circle";
          let templateData = foundry.utils.mergeObject(
            {
              t,
              distance: this.source.system.range.currentValue.toString(),
              width: this.source.system.range.currentValue.toString(),
              angle: game.settings
                .get("teriock", "defaultConeAngle")
                .toString(),
              movable: this.source.system.expansion.type === "detonate",
            },
            templateAutomation?.templateOptions ?? {},
          );
          templateData = await placeTemplateDialog(templateData);
          if (!templateData) return;
          const token = this.actor?.defaultToken;
          let distance = BaseRoll.minValue(
            templateData.distance,
            this.rollData,
          );
          if (token && !templateData.movable) distance += token.document.radius;
          const resolvedTemplateData = {
            angle: BaseRoll.minValue(templateData.angle, this.rollData),
            distance,
            fillColor: game.user.color,
            flags: { teriock: { deleteOnTurnChange: true } },
            t: templateData.t,
            width: BaseRoll.minValue(templateData.width, this.rollData),
            x: token?.center.x || 0,
            y: token?.center.y || 0,
          };
          const templateDocument = new CONFIG.MeasuredTemplate.documentClass(
            resolvedTemplateData,
            { parent: canvas.scene },
          );
          const template = new AbilityTemplate(templateDocument);
          template.sheets = [
            this.actor?.sheet,
            this.source?.sheet,
            this.source?.elder?.sheet,
            ...this.source.allSups.contents.map((s) => s.sheet),
          ];
          template.sheets = Array.from(
            new Set(template.sheets.filter((s) => s)),
          );
          foundry.helpers.Hooks.callAll(
            "teriock.createAbilityTemplate",
            this,
            template,
          );
          template.movable = !!templateData.movable;
          if (templateData.movable || templateData.t !== "circle") {
            ui.notifications.info(
              "TERIOCK.SYSTEMS.Ability.DIALOG.PlaceTemplate.notification",
              { localize: true },
            );
          }
          await template?.drawPreview();
        }
      }

      /** @inheritDoc */
      async _showRollDialog() {
        if (this.source.system.interaction !== "attack") return;
        await super._showRollDialog();
      }
    }
  );
}

import { TeriockDialog } from "../../../../applications/api/_module.mjs";
import { placeTemplateDialog } from "../../../../applications/dialogs/_module.mjs";
import { TeriockTextEditor } from "../../../../applications/ux/_module.mjs";
import { AbilityTemplate } from "../../../../canvas/placeables/_module.mjs";
import { TemplateAutomation } from "../../../../data/pseudo-documents/automations/_module.mjs";
import { BaseRoll } from "../../../../dice/rolls/_module.mjs";
import { createDialogFieldset } from "../../../../helpers/html.mjs";
import { makeIconClass } from "../../../../helpers/utils.mjs";

/**
 * @param {typeof AbilityExecutionConstructor} Base
 */
export default function AbilityExecutionGetInputPart(Base) {
  return (
    /**
     * @extends {AbilityExecutionConstructor}
     * @mixin
     */
    class AbilityExecutionGetInput extends Base {
      /** @inheritDoc */
      get icon() {
        return TERIOCK.display.icons.document.ability;
      }

      /** @inheritDoc */
      get name() {
        return this.source.system.nameString;
      }

      /**
       * @param {string} stat
       * @returns {Promise<number>}
       */
      async #determineCost(stat) {
        if (this.source.system.costs[stat].type === "static") {
          return this.source.system.costs[stat].value.static;
        } else if (this.source.system.costs[stat].type === "formula") {
          const roll = new BaseRoll(
            this.source.system.costs[stat].value.formula,
            this.rollData,
          );
          await roll.evaluate();
          return roll.total;
        } else {
          return 0;
        }
      }

      /**
       * Get user input on costs.
       * @returns {Promise<void>}
       */
      async _getCostInput() {
        const promptGp =
          this.source.system.costs.gp.type === "variable" && !this.options.noGp;
        const promptHp =
          this.source.system.costs.hp.type === "variable" && !this.options.noHp;
        const promptMp =
          this.source.system.costs.mp.type === "variable" && !this.options.noMp;
        const dialogs = [];
        if (promptMp) {
          let mpDescription = this.source.system.costs.mp.value.variable;
          if (this.source.system.adept.enabled) {
            mpDescription +=
              "<div><p>" +
              game.i18n.format(
                "TERIOCK.SYSTEMS.Ability.EXECUTION.descriptions.adept",
                { amount: this.source.system.adept.amount },
              ) +
              "</p>";
          }
          if (this.source.system.gifted.enabled) {
            mpDescription +=
              "<div><p>" +
              game.i18n.format(
                "TERIOCK.SYSTEMS.Ability.EXECUTION.descriptions.gifted",
                { amount: this.source.system.gifted.amount },
              ) +
              "</p>";
          }
          mpDescription = await TeriockTextEditor.enrichHTML(mpDescription);
          const mpMax = this.actor.system.mp.value - this.actor.system.mp.min;
          dialogs.push(
            createDialogFieldset(
              game.i18n.localize(
                "TERIOCK.SYSTEMS.Ability.DIALOG.VariableCosts.mp",
              ),
              mpDescription,
              "mp",
              mpMax,
            ),
          );
        } else {
          this.costs.mp = await this.#determineCost("mp");
        }
        if (promptHp) {
          const hpDescription = await TeriockTextEditor.enrichHTML(
            this.source.system.costs.hp.value.variable,
          );
          const hpMax = this.actor.system.hp.value - this.actor.system.hp.min;
          dialogs.push(
            createDialogFieldset(
              game.i18n.localize(
                "TERIOCK.SYSTEMS.Ability.DIALOG.VariableCosts.hp",
              ),
              hpDescription,
              "hp",
              hpMax,
            ),
          );
        } else {
          this.costs.hp = await this.#determineCost("hp");
        }
        if (promptGp) {
          const gpDescription = await TeriockTextEditor.enrichHTML(
            this.source.system.costs.gp.value.variable,
          );
          dialogs.push(
            createDialogFieldset(
              game.i18n.localize(
                "TERIOCK.SYSTEMS.Ability.DIALOG.VariableCosts.gp",
              ),
              gpDescription,
              "gp",
              Infinity,
            ),
          );
        } else {
          this.costs.gp = await this.#determineCost("gp");
        }
        if (
          this.proficient &&
          this.source.system.heightened &&
          !this.flags.noHeighten
        ) {
          const heightenDescription = await TeriockTextEditor.enrichHTML(
            this.source.system.heightened,
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
              icon: makeIconClass("burst", "title"),
              title: title,
            },
            content: dialogs.join(""),
            modal: true,
            ok: {
              label: game.i18n.localize(
                "TERIOCK.SYSTEMS.Ability.DIALOG.VariableCosts.ok",
              ),
              callback: (_event, button) => {
                for (const [cost, toggle] of Object.entries({
                  hp: promptHp,
                  mp: promptMp,
                  gp: promptGp,
                })) {
                  if (toggle) {
                    this.costs[cost] = Number(
                      button.form.elements.namedItem(cost).value,
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
      }

      /** @inheritDoc */
      async _getInput() {
        await super._getInput();
        await this._getCostInput();
        await this._getTargetInput();
      }

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
          !game.settings.get("teriock", "placeTemplateOnAbilityUse") ||
          templateAutomation?.t === "none";
        const canTemplate = this.source.system.isAoe || !!templateAutomation;
        if (canTemplate && !noTemplate) {
          let t = "circle";
          if (this.source.system.expansion.type === "detonate") t = "circle";
          if (this.source.system.delivery.base === "cone") t = "cone";
          if (this.source.system.delivery.base === "aura") t = "circle";
          let templateData = foundry.utils.mergeObject(
            {
              t,
              distance: this.source.system.range.currentValue.toString(),
              width: this.source.system.range.currentValue.toString(),
              angle: CONFIG.MeasuredTemplate.defaults.angle.toString(),
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
          template.actorSheet = this.actor?.sheet;
          template.movable = templateData.movable;
          foundry.helpers.Hooks.callAll(
            "teriock.createAbilityTemplate",
            this,
            template,
          );
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

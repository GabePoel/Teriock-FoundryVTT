import { TeriockDialog } from "../../../../applications/api/_module.mjs";
import { TeriockTextEditor } from "../../../../applications/ux/_module.mjs";
import { FormulaField } from "../../../../data/fields/_module.mjs";
import { PiercingModel } from "../../../../data/models/_module.mjs";
import { BaseRoll } from "../../../../dice/rolls/_module.mjs";
import { createDialogFieldset } from "../../../../helpers/html.mjs";
import { ucFirst } from "../../../../helpers/string.mjs";
import { makeIconClass } from "../../../../helpers/utils.mjs";

const { fields } = foundry.data;

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
      get _dialogFields() {
        const oldFields = super._dialogFields;
        const newFields = oldFields.filter((f) => f.name === "competence");
        const endFields = oldFields.filter((f) => f.name !== "competence");
        return [
          ...newFields,
          {
            condition: this.isAttack,
            field: new fields.EmbeddedDataField(PiercingModel).fields.raw,
            hint: "TERIOCK.MODELS.Piercing.FIELDS.raw.hint",
            value: this.piercing.raw,
            label: "TERIOCK.MODELS.Piercing.FIELDS.raw.label",
            name: "piercing",
            update: (v) => (this.piercing.raw = v),
          },
          {
            condition: this.isAttack,
            field: new fields.NumberField({ deterministic: false }),
            hint: "TERIOCK.SYSTEMS.Ability.EXECUTION.attackPenalty.existing.hint",
            integer: true,
            label:
              "TERIOCK.SYSTEMS.Ability.EXECUTION.attackPenalty.existing.label",
            max: 0,
            name: "existing-attack-penalty",
            placeholder: 0,
            update: (v) => (this.existingAttackPenalty = v),
            value: this.existingAttackPenalty,
          },
          {
            condition: this.isAttack && this.actor,
            field: new FormulaField({ deterministic: false }),
            hint: "TERIOCK.SYSTEMS.Ability.EXECUTION.attackPenalty.incurred.hint",
            label:
              "TERIOCK.SYSTEMS.Ability.EXECUTION.attackPenalty.incurred.label",
            name: "incurred-attack-penalty",
            placeholder: "0",
            update: (v) => (this.incurredAttackPenalty = v),
            value: this.incurredAttackPenalty,
          },
          ...endFields,
          {
            condition: this.isAttack,
            field: new fields.BooleanField(),
            value: !!this.sb,
            label: "TERIOCK.SYSTEMS.BaseActor.FIELDS.offense.sb.label",
            name: "sb",
            update: (v) => (this.sb = v),
          },
          {
            condition: true,
            field: new fields.BooleanField(),
            label: "TERIOCK.SYSTEMS.Attack.FIELDS.warded.label",
            name: "warded",
            update: (v) => (this.warded = v),
            value: !!this.warded,
          },
          {
            condition: this.source.system.maneuver === "reactive",
            field: new fields.BooleanField(),
            label: "TERIOCK.SYSTEMS.Ability.EXECUTION.usesReaction.label",
            name: "uses-reaction",
            update: (v) => (this.usesReaction = v),
            value: !!this.usesReaction,
          },
          {
            field: new fields.BooleanField(),
            label: "TERIOCK.SYSTEMS.Ability.EXECUTION.payCosts.label",
            name: "pay-costs",
            update: (v) => (this.payCosts = v),
            value: !!this.payCosts,
          },
        ];
      }

      /** @inheritDoc */
      get requiresCompetence() {
        return (
          super.requiresCompetence ||
          this.automations.filter((a) => a.requiresCompetence).length !== 0 ||
          !!this.source.system.overview.proficient ||
          !!this.source.system.overview.fluent ||
          (this.source.system.heightened && !this.flags.noHeighten)
        );
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
        for (const [k, v] of Object.entries(TERIOCK.config.cost.tweaks)) {
          this.costs[v.primary] +=
            v.multiplier * this.source.system.costs.tweaks[k];
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
        for (const [k, v] of Object.entries(TERIOCK.config.cost.primary.keys)) {
          if (this.#shouldShowCostPrompt(k)) {
            dialogs.push(
              createDialogFieldset(
                _loc("TERIOCK.COSTS.Long.primary", {
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
        if (this.canHeighten) {
          const heightenDescription = await TeriockTextEditor.enrichHTML(
            this.source.system.heightened,
            { relativeTo: this.source },
          );
          dialogs.push(
            createDialogFieldset(
              _loc("TERIOCK.SYSTEMS.Ability.DIALOG.VariableCosts.heightened"),
              heightenDescription,
              "heightened",
              this.actor?.system.scaling.p || Infinity,
            ),
          );
        }
        if (dialogs.length > 0) {
          const title = this.source.system.spell
            ? _loc("TERIOCK.SYSTEMS.Ability.EXECUTION.casting", {
                name: this.source.name,
              })
            : _loc("TERIOCK.SYSTEMS.Ability.EXECUTION.executing", {
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
              label: _loc("TERIOCK.SYSTEMS.Ability.DIALOG.VariableCosts.ok"),
              callback: (_event, button) => {
                for (const k of Object.keys(TERIOCK.config.cost.primary.keys)) {
                  if (this.#shouldShowCostPrompt(k)) {
                    this.costs[k] = Number(
                      button.form.elements.namedItem(k).value,
                    );
                  }
                }
                if (this.canHeighten) {
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
      }

      /**
       * Determine targets and place templates.
       * @return {Promise<void>}
       */
      async _getTargets() {
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
      }

      /** @inheritDoc */
      async _postInput() {
        const out = await super._postInput();
        await this._getTargets();
        return out;
      }
    }
  );
}

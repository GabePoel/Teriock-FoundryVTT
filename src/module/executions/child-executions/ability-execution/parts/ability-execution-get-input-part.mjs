import { TeriockDialog } from "../../../../applications/api/_module.mjs";
import { TeriockTextEditor } from "../../../../applications/ux/_module.mjs";
import { BaseRoll } from "../../../../dice/rolls/_module.mjs";
import { createElement } from "../../../../helpers/html.mjs";
import { makeIconClass } from "../../../../helpers/icon.mjs";

/**
 * Creates a dialog fieldset for user input.
 * @param {NumberFieldOptions & { name?: string }} [options]
 * @returns {string} HTML string for the dialog fieldset.
 */
export function createDialogInput(options = {}) {
  const field = new foundry.data.fields.NumberField({ min: 0, nullable: false, placeholder: "0", ...options });
  const formGroup = field.toFormGroup({ classes: ["stacked"], hint: "TEMP", label: options.label }, {
    name: options.name,
    rootId: foundry.utils.randomID(),
    value: 0,
  });
  formGroup.querySelectorAll(".hint").forEach(hint =>
    hint.replaceWith(createElement("div", { className: "hint", innerHTML: options.hint }))
  );
  return formGroup.outerHTML;
}

/**
 * @param {typeof AbilityExecutionConstructor} Base
 */
export default function AbilityExecutionGetInputPart(Base) {
  return (
    /**
     * @extends {AbilityExecutionConstructor}
     * @extends {DocumentExecution}
     * @mixin
     */
    class AbilityExecutionGetInput extends Base {
      /**
       * @param {string} stat
       * @returns {Promise<number>}
       */
      async #determineCost(stat) {
        if (this.source.system.costs.primary[stat].type === "formula") {
          const roll = new BaseRoll(this.source.system.costs.primary[stat].formula, this.getRollData());
          await roll.evaluate();
          return roll.total;
        }
        return 0;
      }

      /**
       * Apply constant adept/inept/gifted modifications to default costs.
       */
      #modifyCosts() {
        for (const [k, v] of Object.entries(TERIOCK.config.cost.tweaks)) {
          this.costs[v.primary] += v.multiplier * this.source.system.costs.tweaks[k];
        }
      }

      /**
       * Whether the prompt for a given cost should be shown.
       * @param {string} stat
       * @returns {boolean}
       */
      #shouldShowCostPrompt(stat) {
        return this.source.system.costs.primary[stat].type === "description" && !this.options[`no${stat.capitalize()}`];
      }

      /** @inheritDoc */
      get _dialogDocuments() {
        const docs = super._dialogDocuments;
        if (this.isContact) {
          docs.push({
            document: this.armament,
            editable: true,
            label: _loc("TYPES.Item.armament"),
            getChoices: () => this.actor?.armaments.filter(a => a.active) ?? [],
            update: armament => this._updateArmament(armament),
          });
        }
        return docs;
      }

      /** @inheritDoc */
      get _formPaths() {
        const paths = ["competence.raw"];
        if (this.isAttack) {
          paths.push("piercing.raw", "existingAttackPenalty");
          if (this.actor) { paths.push("incurredAttackPenalty"); }
        }
        paths.push(...super._formPaths.filter(p => p !== "competence.raw"));
        if (this.isAttack) { paths.push("sb", "vitals"); }
        paths.push("warded");
        if (this.source.system.maneuver === "reactive") { paths.push("usesReaction"); }
        paths.push("payCosts");
        return paths;
      }

      /** @inheritDoc */
      get requiresCompetence() {
        return true;
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
              createDialogInput({
                hint: await TeriockTextEditor.enrichHTML(this.source.system.costs.primary[k].description),
                integer: k !== "gp",
                label: _loc("TERIOCK.COSTS.Long.primary", { key: v.label }),
                name: k,
              }),
            );
          } else {
            this.costs[k] = await this.#determineCost(k);
          }
        }
        if (this.canHeighten) {
          const heightenDescription = await TeriockTextEditor.enrichHTML(this.source.system.heightened, {
            relativeTo: this.source,
          });
          dialogs.push(
            createDialogInput({
              hint: heightenDescription,
              integer: true,
              label: _loc("TERIOCK.SYSTEMS.Ability.DIALOG.VariableCosts.heightened"),
              max: this.actor?.system.scaling.p,
              name: "heightened",
            }),
          );
        }
        if (dialogs.length > 0) {
          const title = this.source.system.spell
            ? _loc("TERIOCK.SYSTEMS.Ability.EXECUTION.casting", { name: this.source.name })
            : _loc("TERIOCK.SYSTEMS.Ability.EXECUTION.executing", { name: this.source.name });
          await TeriockDialog.prompt({
            content: dialogs.join(""),
            modal: true,
            ok: {
              label: _loc("TERIOCK.SYSTEMS.Ability.DIALOG.VariableCosts.ok"),
              callback: (_event, button) => {
                for (const k of Object.keys(TERIOCK.config.cost.primary.keys)) {
                  if (this.#shouldShowCostPrompt(k)) {
                    this.costs[k] = Number(button.form.elements.namedItem(k).value || "0") || 0;
                  }
                }
                if (this.canHeighten) {
                  this.heightened = Number(button.form.elements.namedItem("heightened").value);
                  this.costs.mp += this.heightened;
                }
              },
            },
            window: { icon: makeIconClass(TERIOCK.display.icons.document.ability, "title"), title },
          });
        }
        this.#modifyCosts();
      }

      /** @inheritDoc */
      async _getInput() {
        const out = await super._getInput();
        if (out === false) { return out; }
        await this._getCostInput();
        return out;
      }

      /**
       * Determine targets and place templates.
       * @return {Promise<void>}
       */
      async _getTargets() {
        if (this.source.system.targets.size === 1 && this.source.system.targets.has("self") && this.executor) {
          this.targets.add(this.executor);
        } else { for (const target of game.user.targets) { this.targets.add(target); } }
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

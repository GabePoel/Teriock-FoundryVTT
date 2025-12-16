import { TeriockDialog } from "../../../../applications/api/_module.mjs";
import { TeriockTextEditor } from "../../../../applications/ux/_module.mjs";
import { TeriockAbilityTemplate } from "../../../../canvas/placeables/_module.mjs";
import { TeriockRoll } from "../../../../dice/_module.mjs";
import { createDialogFieldset } from "../../../../helpers/html.mjs";
import { makeIconClass } from "../../../../helpers/utils.mjs";

/**
 * @param {typeof AbilityExecutionConstructor} Base
 */
export default function AbilityExecutionGetInputPart(Base) {
  /**
   * @extends {AbilityExecutionConstructor}
   * @mixin
   */
  return class AbilityExecutionGetInput extends Base {
    /**
     * @param {string} stat
     * @returns {Promise<number>}
     */
    async #determineCost(stat) {
      if (this.source.system.costs[stat].type === "static") {
        return this.source.system.costs[stat].value.static;
      } else if (this.source.system.costs[stat].type === "formula") {
        const roll = new TeriockRoll(
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
     * @private
     */
    async _getCostInput() {
      const dialogs = [];
      if (this.source.system.costs.mp.type === "variable") {
        let mpDescription = this.source.system.costs.mp.value.variable;
        if (this.source.system.adept.enabled) {
          mpDescription +=
            `<div><p>This ability is @L[Keyword:Adept]{adept} and this cost will automatically be ` +
            `decreaesd by ${this.source.system.adept.amount}.</p>`;
        }
        if (this.source.system.gifted.enabled) {
          mpDescription +=
            `<div><p>This ability is @L[Keyword:Gifted]{gifted} and this cost will automatically be ` +
            `increased by ${this.source.system.gifted.amount}.</p>`;
        }
        mpDescription = await TeriockTextEditor.enrichHTML(mpDescription);
        const mpMax = this.actor.system.mp.value - this.actor.system.mp.min;
        dialogs.push(
          createDialogFieldset(
            "Variable Mana Cost",
            mpDescription,
            "mp",
            mpMax,
          ),
        );
      } else {
        this.costs.mp = await this.#determineCost("mp");
      }
      if (this.source.system.costs.hp.type === "variable") {
        const hpDescription = await TeriockTextEditor.enrichHTML(
          this.source.system.costs.hp.value.variable,
        );
        const hpMax = this.actor.system.hp.value - this.actor.system.hp.min;
        dialogs.push(
          createDialogFieldset("Variable Hit Cost", hpDescription, "hp", hpMax),
        );
      } else {
        this.costs.hp = await this.#determineCost("hp");
      }
      if (this.source.system.costs.gp.type === "variable") {
        const gpDescription = await TeriockTextEditor.enrichHTML(
          this.source.system.costs.gp.value.variable,
        );
        dialogs.push(
          createDialogFieldset(
            "Variable Gold Cost",
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
            "Heightened Amount",
            heightenDescription,
            "heightened",
            this.actor?.system.scaling.p || Infinity,
          ),
        );
      }
      if (dialogs.length > 0) {
        const execution = this.source.system.spell ? "Casting" : "Executing";
        const title = `${execution} ${this.source.name}`;
        await TeriockDialog.prompt({
          window: {
            icon: makeIconClass("burst", "title"),
            title: title,
          },
          content: dialogs.join(""),
          modal: true,
          ok: {
            label: "Confirm",
            callback: (_event, button) => {
              for (const cost of ["hp", "mp", "gp"]) {
                if (this.source.system.costs[cost].type === "variable") {
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
      await this._getCostInput();
      await this._getTargetInput();
    }

    /**
     * Get user input on targets.
     * @returns {Promise<void>}
     * @private
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
      this.flags.noTemplate =
        this.flags.noTemplate || this.mergeImpactsBool("noTemplate");
      if (
        this.source.system.isAoe &&
        !this.flags.noTemplate &&
        game.settings.get("teriock", "placeTemplateOnAbilityUse")
      ) {
        let placeTemplate;
        let distance = Number(this.source.system.range);
        placeTemplate = await TeriockDialog.prompt({
          window: { title: "Template Confirmation" },
          modal: true,
          content: `
            <p>Place measured template?</p>
            <div class="standard-form form-group">
              <label>Distance <span class="units">(ft)</span></label>
              <input name='range' type='number' min='0' step='1' value='${this.source.system.range}'>
            </div>
          `,
          ok: {
            label: "Yes",
            callback: (_event, button) => {
              distance = Number(button.form.elements.namedItem("range").value);
            },
          },
        });
        if (placeTemplate) {
          const abilityTemplate = TeriockAbilityTemplate.fromExecution(this, {
            distance: distance,
          });
          await abilityTemplate.drawPreview();
        }
      }
    }
  };
}

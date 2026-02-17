import { TeriockDialog } from "../../../../applications/api/_module.mjs";
import { TeriockTextEditor } from "../../../../applications/ux/_module.mjs";
import { AbilityTemplate } from "../../../../canvas/placeables/_module.mjs";
import { BaseRoll } from "../../../../dice/rolls/_module.mjs";
import { createDialogFieldset } from "../../../../helpers/html.mjs";
import { dedent } from "../../../../helpers/string.mjs";
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
        if (promptHp) {
          const hpDescription = await TeriockTextEditor.enrichHTML(
            this.source.system.costs.hp.value.variable,
          );
          const hpMax = this.actor.system.hp.value - this.actor.system.hp.min;
          dialogs.push(
            createDialogFieldset(
              "Variable Hit Cost",
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

      /**
       * Get user input on targets.
       * @returns {Promise<void>}
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
        if (
          this.source.system.isAoe &&
          !this.flags.noTemplate &&
          game.settings.get("teriock", "placeTemplateOnAbilityUse") &&
          this.actor
        ) {
          let placeTemplate;
          let distance = Number(this.source.system.range);
          const rangeId = foundry.utils.randomID();
          const tokenId = foundry.utils.randomID();
          placeTemplate = await TeriockDialog.prompt({
            window: { title: "Template Confirmation" },
            modal: true,
            content: dedent(`
            <div class="standard-form form-group">
              <label for="${rangeId}">Distance <span class="units">(ft)</span></label>
              <input 
                id="${rangeId}" 
                name='range' 
                type='number'
                min='0' 
                step='1' 
                value='${this.source.system.range.currentValue}'
              >
            </div>
            <div class="standard-form form-group">
              <label for="${tokenId}">Add Token Radius</label>
              <input id="${tokenId}" name="token" type="checkbox" checked="checked">
            </div>
          `),
            ok: {
              label: "Place Template",
              callback: (_event, button) => {
                distance =
                  Number(button.form.elements.namedItem("range").value) +
                  (button.form.elements["token"].checked
                    ? ((this.actor.system.size.length ?? 0) / 2) * 5
                    : 0);
              },
            },
          });
          if (placeTemplate) {
            const abilityTemplate = AbilityTemplate.fromExecution(this, {
              distance: distance,
            });
            await abilityTemplate?.drawPreview();
          }
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

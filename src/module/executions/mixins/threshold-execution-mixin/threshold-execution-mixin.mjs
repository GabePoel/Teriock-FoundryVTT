import { TeriockDialog } from "../../../applications/api/_module.mjs";
import { addFormula, formulaExists } from "../../../helpers/formula.mjs";
import { makeIconClass } from "../../../helpers/utils.mjs";

/**
 * Mixin for executions involving a d20 roll.
 * @param {typeof BaseExecution} Base
 */
export default function ThresholdExecutionMixin(Base) {
  return (
    /**
     * @extends {BaseExecution}
     * @mixin
     */
    class ThresholdExecution extends Base {
      /**
       * @param {Teriock.Execution.ThresholdExecutionOptions} options
       */
      constructor(options = {}) {
        super(options);
        const {
          threshold,
          formula = undefined,
          edge = 0,
          bonus = "",
          comparison = "gte",
          showDialog = false,
        } = options;
        this.edge = edge;
        this.threshold = threshold;
        this.formula = formula;
        this.bonus = `${bonus}`;
        this.comparison = comparison;
        this.showDialog = showDialog;
      }

      /** @inheritDoc */
      get rollOptions() {
        return {
          flavor: this.flavor,
          threshold: this.threshold,
          comparison: this.comparison,
        };
      }

      /** @inheritDoc */
      async _getInput() {
        if (this.showDialog) {
          await this._showRollDialog();
        }
        await super._getInput();
      }

      /**
       * Prepare an underlying core formula.
       * @returns {Promise<void>}
       */
      async _prepareBaseFormula() {
        if (!this.formula) {
          let suffix = "";
          if (this.edge > 0) suffix = "kh1";
          if (this.edge < 0) suffix = "kl1";
          this.formula = `${1 + Math.abs(this.edge)}d20${suffix}`;
        }
      }

      /** @inheritDoc */
      async _prepareFormula() {
        await this._prepareBaseFormula();
        await super._prepareFormula();
        if (formulaExists(this.bonus)) {
          this.formula = addFormula(this.formula, this.bonus);
        }
      }

      /**
       * Show a dialog to configure basic roll options.
       * @returns {Promise<void>}
       * @private
       */
      async _showRollDialog() {
        await TeriockDialog.wait({
          window: {
            title: "Roll Options",
            icon: makeIconClass("dice-d20", "title"),
          },
          modal: true,
          content:
            "<p>Would you like to roll with advantage or disadvantage?</p>",
          buttons: [
            {
              action: "disadvantage",
              icon: makeIconClass("dice-d20", "button"),
              label: "Roll with Disadvantage",
              callback: () => {
                this.edge = -1;
              },
            },
            {
              action: "normal",
              default: true,
              icon: makeIconClass("dice-d20", "button"),
              label: "Roll Normally",
              callback: () => {
                this.edge = 0;
              },
            },
            {
              action: "advantage",
              icon: makeIconClass("dice-d20", "button"),
              label: "Roll with Advantage",
              callback: () => {
                this.edge = 1;
              },
            },
          ],
        });
      }
    }
  );
}

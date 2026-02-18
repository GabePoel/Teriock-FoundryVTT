import { TeriockDialog } from "../../../applications/api/_module.mjs";
import { FormulaField } from "../../../data/fields/_module.mjs";
import { CompetenceModel } from "../../../data/models/_module.mjs";
import { addFormula, formulaExists } from "../../../helpers/formula.mjs";
import { makeIconClass } from "../../../helpers/utils.mjs";

const { fields } = foundry.data;

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
          showDialog = game.settings.get("teriock", "showRollDialogs"),
        } = options;
        this.edge = edge;
        this.threshold = threshold;
        this.formula = formula;
        this.bonus = `${bonus}`;
        this.comparison = comparison;
        this.showDialog = showDialog;
      }

      /**
       * An icon for this execution to show in dialogs.
       * @returns {string}
       */
      get icon() {
        return "dice-d20";
      }

      /**
       * A name for this execution to show in dialogs.
       * @returns {string}
       */
      get name() {
        return "";
      }

      /** @inheritDoc */
      get rollOptions() {
        return {
          flavor: this.flavor,
          threshold: this.threshold,
          comparison: this.comparison,
        };
      }

      /**
       * Update this given the choices selected in the roll dialog.
       * @param {HTMLButtonElement} button
       */
      #updateFromRollDialog(button) {
        const competence = button.form.elements.namedItem("competence").value;
        if (Number(competence) === 2) {
          this.fluent = true;
          this.proficient = true;
        } else if (Number(competence) === 1) {
          this.fluent = false;
          this.proficient = true;
        } else {
          this.fluent = false;
          this.proficient = false;
        }
        const bonus = button.form.elements.namedItem("bonus").value;
        if (bonus) this.bonus = addFormula(this.bonus, bonus);
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
        let initialCompetence = 0;
        if (this.proficient) initialCompetence = 1;
        if (this.fluent) initialCompetence = 2;
        const competenceField = new fields.EmbeddedDataField(CompetenceModel);
        const competenceFormGroup = competenceField.fields.raw.toFormGroup(
          {
            label: "Competence",
            hint: "Whether this roll has proficiency or fluency.",
          },
          { name: "competence", value: initialCompetence },
        );
        const bonusField = new FormulaField({
          label: "Circumstance Bonus",
          hint: "An additional bonus to apply to this roll.",
          initial: "",
        });
        const content = document.createElement("div");
        content.classList.add("teriock-form-container");
        const bonusFormGroup = bonusField.toFormGroup({}, { name: "bonus" });
        content.append(...[competenceFormGroup, bonusFormGroup]);
        await TeriockDialog.wait({
          window: {
            title: `${this.name} Roll Options`.trim(),
            icon: makeIconClass(this.icon, "title"),
          },
          modal: true,
          content: content.outerHTML,
          buttons: [
            {
              action: "disadvantage",
              icon: makeIconClass("dice-d20", "button"),
              label: "Disadvantage",
              callback: (_event, button) => {
                this.#updateFromRollDialog(button);
                this.edge = -1;
              },
            },
            {
              action: "normal",
              default: true,
              icon: makeIconClass("dice-d20", "button"),
              label: "Normal",
              callback: (_event, button) => {
                this.#updateFromRollDialog(button);
                this.edge = 0;
              },
            },
            {
              action: "advantage",
              icon: makeIconClass("dice-d20", "button"),
              label: "Advantage",
              callback: (_event, button) => {
                this.#updateFromRollDialog(button);
                this.edge = 1;
              },
            },
          ],
        });
      }
    }
  );
}

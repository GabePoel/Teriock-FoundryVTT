import mathConfig from "../../../constants/config/math-config.mjs";
import { FormulaField } from "../../../data/fields/_module.mjs";
import { ThresholdRoll } from "../../../dice/rolls/_module.mjs";
import { addFormula, formulaExists } from "../../../helpers/formula.mjs";
import { objectMap } from "../../../helpers/utils.mjs";

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
      /** @inheritDoc */
      static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.EXECUTIONS.Threshold"];

      /** @inheritDoc */
      static defineSchema() {
        return Object.assign(super.defineSchema(), {
          bonus: new FormulaField({ deterministic: false, initial: "" }),
          comparison: new fields.StringField({
            blank: false,
            choices: objectMap(mathConfig.comparisons, (c) => c.label, { localize: true }),
            initial: "gte",
            label: "TERIOCK.EXPIRATIONS.Base.FIELDS.roll.comparison.label",
            required: true,
          }),
          edge: new fields.NumberField({ initial: 0, integer: true, nullable: false }),
        });
      }

      /**
       * @param {object} [data]
       * @param {Teriock.Execution.ThresholdExecutionOptions} [options]
       */
      constructor(data = {}, options = {}) {
        super(data, options);
        this.threshold = options.threshold;
      }

      /** @type {number|undefined} */
      threshold;

      /** @inheritDoc */
      get _dialogButtons() {
        if (!this.isRoll) { return super._dialogButtons; }
        return [{
          action: "confirm",
          default: this.edge < 0,
          icon: "fa-dice-d20",
          label: "TERIOCK.DIALOGS.ThresholdExecutionOptions.BUTTONS.disadvantage",
          name: "disadvantage",
          callback: () => this.updateSource({ edge: -1 }),
        }, {
          action: "confirm",
          default: this.edge === 0,
          icon: "fa-dice-d20",
          label: "TERIOCK.DIALOGS.ThresholdExecutionOptions.BUTTONS.normal",
          name: "normal",
          callback: () => this.updateSource({ edge: 0 }),
        }, {
          action: "confirm",
          default: this.edge > 0,
          icon: "fa-dice-d20",
          label: "TERIOCK.DIALOGS.ThresholdExecutionOptions.BUTTONS.advantage",
          name: "advantage",
          callback: () => this.updateSource({ edge: 1 }),
        }];
      }

      /** @inheritDoc */
      get _formPaths() {
        const paths = [];
        if (this.requiresCompetence) { paths.push("competence.raw"); }
        if (this.hasBonus) { paths.push("bonus"); }
        return [...paths, ...super._formPaths];
      }

      /** @inheritDoc */
      get _RollClass() {
        return ThresholdRoll;
      }

      /**
       * Whether this can have a bonus applied.
       * @return {boolean}
       */
      get hasBonus() {
        return this.isRoll;
      }

      /**
       * If this is a roll.
       * @return {boolean}
       */
      get isRoll() {
        return true;
      }

      /**
       * Whether this execution requires competence.
       * @return {boolean}
       */
      get requiresCompetence() {
        return this.isRoll;
      }

      /** @inheritDoc */
      get rollOptions() {
        return { comparison: this.comparison, flavor: this.flavor, threshold: this.threshold };
      }

      /** @inheritDoc */
      async _improveFormula() {
        await super._improveFormula();
        if (formulaExists(this.bonus)) { this.formula = addFormula(this.formula, this.bonus); }
      }

      /**
       * Prepare an underlying core formula.
       * @returns {Promise<void>}
       */
      async _prepareBaseFormula() {
        if (!this.formula) {
          let suffix = "";
          if (this.edge > 0) { suffix = "kh1"; }
          if (this.edge < 0) { suffix = "kl1"; }
          this.formula = `${1 + Math.abs(this.edge)}d20${suffix}`;
        }
      }

      /** @inheritDoc */
      async _prepareFormula() {
        await this._prepareBaseFormula();
        await super._prepareFormula();
      }
    }
  );
}

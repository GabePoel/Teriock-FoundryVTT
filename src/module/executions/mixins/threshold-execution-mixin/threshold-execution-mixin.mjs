import mathConfig from "../../../constants/config/math-config.mjs";
import { rollableFormulaField } from "../../../data/fields/tools/builders.mjs";
import { ThresholdRoll } from "../../../dice/rolls/_module.mjs";
import { addFormula, formulaExists } from "../../../helpers/formula.mjs";
import { objectMap } from "../../../helpers/utils.mjs";

/**
 * @import BaseExecution from "../../abstract/base-execution/base-execution.mjs";
 */

const { fields } = foundry.data;

/**
 * Mixin for executions involving a d20 roll.
 * @template {MixinBase<typeof BaseExecution>} T
 * @param {T} Base
 */
export default function ThresholdExecutionMixin(Base) {
  /**
   * @mixin
   * @implements {Teriock.Execution.ThresholdExecutionData}
   */
  class ThresholdExecution
    extends /** @type {InitializedDataModel<T, Teriock.Execution.ThresholdExecutionData>} */ (Base)
  {
    /** @inheritDoc */
    static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.EXECUTIONS.Threshold"];

    /** @inheritDoc */
    static defineSchema() {
      return Object.assign(super.defineSchema(), {
        bonus: rollableFormulaField(),
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

    /** @inheritDoc */
    get _dialogButtons() {
      if (!this.isRoll) { return super._dialogButtons; }
      return [{
        action: "confirm",
        default: this.edge < 0,
        icon: "fa-dice-d20",
        label: "TERIOCK.DIALOGS.ThresholdExecutionOptions.BUTTONS.disadvantage",
        name: "disadvantage",
        type: "button",
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
        type: "button",
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
      return {
        flavor: this.flavor,
        thresholds: typeof this.threshold === "number"
          ? [{ comparison: this.comparison, inverse: true, level: 1, target: this.threshold, type: "roll" }]
          : [],
      };
    }

    /**
     * @inheritDoc
     * @param {Teriock.Execution.ConstructionOptions<Teriock.Execution.ThresholdExecutionOptions>} [options]
     */
    _configure(options = {}) {
      super._configure(options);
      this.threshold = options.threshold;
    }

    /** @inheritDoc */
    async _improveFormula() {
      await super._improveFormula();
      if (formulaExists(this.bonus)) { this.updateSource({ formula: addFormula(this.formula, this.bonus) }); }
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
        this.updateSource({ formula: `${1 + Math.abs(this.edge)}d20${suffix}` });
      }
    }

    /** @inheritDoc */
    async _prepareFormula() {
      await this._prepareBaseFormula();
      await super._prepareFormula();
    }
  }

  return ThresholdExecution;
}

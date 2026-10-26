import { FormulaField } from "../../../data/fields/_module.mjs";
import { rollableFormulaField } from "../../../data/fields/tools/builders.mjs";
import { ThresholdRoll } from "../../../dice/rolls/_module.mjs";
import { objectMap } from "../../../utils/_module.mjs";

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
          choices: objectMap(TERIOCK.CONFIG.math.comparisons, (c) => c.label, { localize: true }),
          initial: "gte",
          label: "TERIOCK.EXPIRATIONS.Base.FIELDS.roll.comparison.label",
          required: true,
        }),
        edge: new fields.NumberField({ initial: 0, integer: true, nullable: false }),
        participants: new fields.NumberField({ initial: 1, integer: true, min: 1, nullable: false }),
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
    get _dialogDocuments() {
      const docs = super._dialogDocuments;
      if (this.canShareRoll) {
        docs.push({
          document: this.combatant.group,
          editable: true,
          label: _loc("TERIOCK.EXECUTIONS.Threshold.FIELDS.participants.label"),
          locked: [this.combatant],
          multi: true,
          priority: -1,
          selected: this.mobMembers,
          selectHint: "TERIOCK.DIALOGS.Select.MobMembers.hint",
          selectTitle: "TERIOCK.DIALOGS.Select.MobMembers.title",
          getChoices: () => [...this.combatant.group.members],
          update: members => {
            this.mobMembers = members;
            this.updateSource({ participants: this.mobMembers.length });
          },
        });
      }
      return docs;
    }

    /** @inheritDoc */
    get _formPaths() {
      const paths = [];
      if (this.requiresCompetence) { paths.push("competence.raw"); }
      if (this.hasBonus) { paths.push("bonus"); }
      if (this.canShareRoll) { paths.push("participants"); }
      return [...paths, ...super._formPaths];
    }

    /** @inheritDoc */
    get _RollClass() {
      return ThresholdRoll;
    }

    /**
     * Whether a mob can share this roll.
     * @returns {boolean}
     * @category Groups
     */
    get canShareRoll() {
      return this.isRoll && this.combatant?.group?.type === "mob";
    }

    /** @inheritDoc */
    get combatants() {
      if (!this.canShareRoll) { return super.combatants; }
      return [...new Set(this.mobMembers.map(m => m.system.defaultCombatant))];
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

    /**
     * Relevant wiki pages:
     * - [Mobs](https://wiki.teriock.com/index.php?title=Core:Mobs)
     *
     * @inheritDoc
     */
    async _evaluateRolls() {
      if ((await super._evaluateRolls()) === false) { return false; }
      if (this.participants < 2) { return; }
      const { NumericTerm, OperatorTerm } = foundry.dice.terms;
      const rolls = [];
      for (const roll of this.rolls) {
        rolls.push(roll);
        for (let i = 1; i < this.participants; i++) {
          rolls.push(
            roll.constructor.fromTerms([
              ...roll.clone({ evaluated: true }).terms,
              new OperatorTerm({ operator: "-" }),
              NumericTerm.fromData({ class: "NumericTerm", evaluated: true, number: 2 * i }),
            ], foundry.utils.deepClone(roll.options)),
          );
        }
      }
      this.rolls = rolls;
    }

    /** @inheritDoc */
    async _improveFormula() {
      await super._improveFormula();
      if (FormulaField.exists(this.bonus)) { this.updateSource({
          formula: FormulaField.add(this.formula, this.bonus),
        }); }
      if (this.participants > 1) {
        this.updateSource({ formula: FormulaField.add(this.formula, String(this.participants - 1)) });
      }
    }

    /**
     * @inheritDoc
     * @param {Teriock.Execution.ConstructionOptions<Teriock.Execution.ThresholdExecutionOptions>} [options]
     */
    _initialize(options = {}) {
      super._initialize(options);
      if (!("strict" in options)) { return; }
      this.mobMembers = [];
      if (!this.canShareRoll) { return; }
      this.mobMembers = options.mobMembers
        ?? [...this.combatant.group.members].filter(m => m === this.combatant || m.token?.object?.controlled);
      this.updateSource({ participants: this.mobMembers.length });
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

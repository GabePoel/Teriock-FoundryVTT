import { FormulaField } from "../../../data/fields/_module.mjs";
import { rollableFormulaField } from "../../../data/fields/tools/builders.mjs";
import { BaseModifierModel, CompetenceModel } from "../../../data/models/_module.mjs";
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
        base: rollableFormulaField(),
        bonus: rollableFormulaField(),
        circumstance: rollableFormulaField(),
        comparison: new fields.StringField({
          blank: false,
          choices: objectMap(TERIOCK.CONFIG.math.comparisons, (c) => c.label, { localize: true }),
          initial: "gte",
          label: "TERIOCK.EXPIRATIONS.Base.FIELDS.roll.comparison.label",
          required: true,
        }),
        die: rollableFormulaField({ initial: BaseModifierModel.metadata.initialDie }),
        edge: new fields.NumberField({ initial: 0, integer: true, nullable: false }),
        multiplier: new fields.NumberField({
          initial: BaseModifierModel.metadata.initialMultiplier,
          integer: true,
          nullable: false,
        }),
        participants: new fields.NumberField({ initial: 1, integer: true, min: 1, nullable: false }),
        term: rollableFormulaField(),
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
      if (this.canShareRolls) {
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
      const paths = ["competence.raw"];
      if (this.hasCircumstance) { paths.push("circumstance", "formula"); }
      if (this.canShareRolls) { paths.push("participants"); }
      return [...paths, ...super._formPaths];
    }

    /** @inheritDoc */
    get _RollClass() {
      return ThresholdRoll;
    }

    /**
     * Whether a group can share this roll.
     * @returns {boolean}
     * @category Groups
     */
    get canShareRolls() {
      return Boolean(this.combatant?.group?.system.canShareRolls);
    }

    /** @inheritDoc */
    get combatants() {
      if (!this.canShareRolls) { return super.combatants; }
      return [...new Set(this.mobMembers.map(m => m.system.defaultCombatant))];
    }

    /**
     * Whether competence improves the formula.
     * @returns {boolean}
     */
    get competenceImprovesFormula() {
      return this.isRoll;
    }

    /**
     * A default formula.
     * @returns {Teriock.System.FormulaString}
     */
    get defaultFormula() {
      const competence = this.competenceImprovesFormula ? this.competence : new CompetenceModel();
      const formula = BaseModifierModel.getFormula({ ...this.toObject(), competence });
      return this.isRoll && this.participants > 1 ? FormulaField.add(formula, String(this.participants - 1)) : formula;
    }

    /**
     * Whether this can have a circumstance bonus applied.
     * @returns {boolean}
     */
    get hasCircumstance() {
      return this.isRoll;
    }

    /**
     * If this is a roll.
     * @returns {boolean}
     */
    get isRoll() {
      return true;
    }

    /**
     * A modifier to provide formula components.
     * @returns {BaseModifierModel|null}
     */
    get modifier() {
      return null;
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
      const { modifier } = this;
      if (modifier) {
        Object.assign(this._source, {
          base: modifier.base,
          bonus: modifier.bonus,
          multiplier: modifier.metadata.initialMultiplier,
          term: modifier.term,
        });
      }
    }

    /**
     * Relevant wiki pages:
     * - [Mobs](https://wiki.teriock.com/index.php?title=Core:Mobs)
     *
     * @inheritDoc
     */
    async _evaluateRolls() {
      if ((await super._evaluateRolls()) === false) { return false; }
      if (!this.isRoll || this.participants < 2) { return; }
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

    /**
     * @inheritDoc
     * @param {Teriock.Execution.ConstructionOptions<Teriock.Execution.ThresholdExecutionOptions>} [options]
     */
    _initialize(options = {}) {
      super._initialize(options);
      if (!("strict" in options)) { return; }
      this.mobMembers = [];
      if (!this.canShareRolls) { return; }
      this.mobMembers = options.mobMembers
        ?? [...this.combatant.group.members].filter(m => m === this.combatant || m.token?.object?.controlled);
      this.updateSource({ participants: this.mobMembers.length });
    }

    /** @inheritDoc */
    async _prepareFormula() {
      if (!this.formula) { this.updateSource({ formula: this.defaultFormula }); }
      await super._prepareFormula();
    }

    /** @inheritDoc */
    getRollData() {
      return Object.assign(super.getRollData(), { m: this.participants });
    }
  }

  return ThresholdExecution;
}

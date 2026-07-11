import { FormulaField } from "../../../data/fields/_module.mjs";
import { HarmRoll } from "../../../dice/rolls/_module.mjs";
import { formulaExists } from "../../../helpers/formula.mjs";
import { objectMap } from "../../../helpers/utils.mjs";

const { fields } = foundry.data;

/**
 * Mixin for executions that deal an impact and can be modified with boosts, deboosts, and critical hits. This replicates
 * the logic of the old `boostDialog` inside the execution framework.
 * @param {typeof BaseExecution} Base
 */
export default function ImpactsExecutionMixin(Base) {
  return (
    /**
     * @extends {BaseExecution}
     * @mixin
     */
    class ImpactsExecution extends Base {
      /** @inheritDoc */
      static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.EXECUTIONS.Boost"];

      /** @inheritDoc */
      static defineSchema() {
        return Object.assign(super.defineSchema(), {
          boosts: new fields.NumberField({ initial: 0, integer: true, min: 0, nullable: false }),
          crit: new fields.BooleanField(),
          deboosts: new fields.NumberField({ initial: 0, integer: true, min: 0, nullable: false }),
          formula: new FormulaField({ deterministic: false, initial: "" }),
          impacts: new fields.SetField(
            new fields.StringField({
              choices: objectMap(TERIOCK.config.impact, i => i.deal, { filter: c => !c?.hidden }),
            }),
            { initial: ["damage"] },
          ),
        });
      }

      /** @inheritDoc */
      get _dialogButtons() {
        return [{
          action: "confirm",
          default: !this.crit,
          icon: TERIOCK.display.icons.consequence.none,
          label: "TERIOCK.DIALOGS.Boost.BUTTONS.ok",
          name: "ok",
          callback: () => this.updateSource({ crit: false }),
        }, {
          action: "confirm",
          default: this.crit,
          icon: TERIOCK.display.icons.consequence.crit,
          label: "TERIOCK.DIALOGS.Boost.BUTTONS.crit",
          name: "crit",
          callback: () => this.updateSource({ crit: true }),
        }];
      }

      /** @inheritDoc */
      get _formPaths() {
        const paths = [];
        if (this.hasFormula) { paths.push("impacts", "formula", "boosts", "deboosts"); }
        return [...paths, ...super._formPaths];
      }

      /** @inheritDoc */
      get _RollClass() {
        return HarmRoll;
      }

      /**
       * A copy of the evaluated base roll for each impact this deals.
       * @returns {HarmRoll[]}
       */
      get _typedRolls() {
        if (this.rolls.length === 0) { return []; }
        const roll = this.rolls[0];
        return Array.from(this.impacts).map(impact => {
          const impactRoll = roll.clone({ evaluated: true });
          impactRoll.impact = impact;
          return impactRoll;
        });
      }

      /** @inheritDoc */
      get chatData() {
        return { ...super.chatData, rolls: this._typedRolls };
      }

      /** @inheritDoc */
      get flavor() {
        if (this.impacts.size === 1) {
          return _loc("TERIOCK.ROLLS.Base.name", { value: TERIOCK.config.impact[this.impacts.first()]?.label });
        }
        return _loc("TERIOCK.ROLLS.Harm.multi");
      }

      /**
       * Whether to show the roll dialogs.
       * @returns {boolean}
       */
      get hasFormula() {
        return true;
      }

      /** @inheritDoc */
      get icon() {
        return super.icon ?? TERIOCK.display.icons.ui.dice;
      }

      /**
       * The single impact this deals, if it only deals one. Used for the input dialog title and base roll options.
       * @returns {Teriock.Keys.Impact|null}
       */
      get impact() {
        if (this.impacts.size === 1) { return this.impacts.first(); }
        return null;
      }

      /** @inheritDoc */
      get rollOptions() {
        const options = super.rollOptions;
        if (this.impact) { options.impact = this.impact; }
        return options;
      }

      /**
       * Apply boosts, deboosts, and critical modifiers to the formula. This mirrors the logic that used to live in the
       * `boostDialog` confirmation callback.
       */
      _applyImpactModifiers() {
        if (!formulaExists(this.formula)) { return; }
        if (this.crit) {
          const roll = new this._RollClass(this.formula, this.getRollData());
          roll.alter(2, 0, { multiplyNumeric: false });
          this.formula = roll.formula;
        }
        const setBoostNumber = (this.boosts - this.deboosts) * (this.crit ? 2 : 1);
        if (setBoostNumber !== 0) { this.formula = `sb(${this.formula}, ${setBoostNumber})`; }
      }

      /** @inheritDoc */
      async _buildActivations() {
        for (const roll of this._typedRolls) { this.activations.push(...(await roll.getActivations())); }
        await super._buildActivations();
      }

      /** @inheritDoc */
      async _buildPanels() {
        await super._buildPanels();
        for (const roll of this._typedRolls) { this.panels.push(...(await roll.getPanels())); }
      }

      /** @inheritDoc */
      async _buildTags() {
        await super._buildTags();
        if (this.crit) { this.tags.push(_loc("TERIOCK.DIALOGS.Boost.TAGS.crit")); }
      }

      /** @inheritDoc */
      async _prepareFormula() {
        await super._prepareFormula();
        this._applyImpactModifiers();
      }
    }
  );
}

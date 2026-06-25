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
      /**
       * @param {Teriock.Execution.ImpactsExecutionOptions} options
       */
      constructor(options = {}) {
        super(options);
        const netBoosts = typeof options.boosts === "number" ? options.boosts : 0;
        this.crit = options.crit ?? false;
        this.boosts = netBoosts > 0 ? netBoosts : 0;
        this.deboosts = netBoosts < 0 ? -netBoosts : 0;
        this.impacts = new Set(options.impacts ?? (options.impact ? [options.impact] : ["damage"]));
        this.showDialog = options.showDialog ?? game.teriock.getSetting("showRollDialogs");
      }

      /** @type {number} */
      boosts = 0;

      /** @type {boolean} */
      crit = false;

      /** @type {number} */
      deboosts = 0;

      /** @type {Set<Teriock.Keys.Impact>} */
      impacts = new Set(["damage"]);

      /** @inheritDoc */
      get _dialogButtons() {
        return [{
          action: "confirm",
          default: !this.crit,
          icon: TERIOCK.display.icons.consequence.none,
          label: "TERIOCK.DIALOGS.Boost.BUTTONS.ok",
          name: "ok",
          callback: () => (this.crit = false),
        }, {
          action: "confirm",
          default: this.crit,
          icon: TERIOCK.display.icons.consequence.crit,
          label: "TERIOCK.DIALOGS.Boost.BUTTONS.crit",
          name: "crit",
          callback: () => (this.crit = true),
        }];
      }

      /** @inheritDoc */
      get _dialogFields() {
        return [{
          field: new fields.SetField(
            new fields.StringField({
              choices: objectMap(TERIOCK.config.impact, i => i.deal, { filter: c => !c?.hidden }),
            }),
          ),
          hint: "TERIOCK.DIALOGS.Boost.FIELDS.impacts.hint",
          label: "TERIOCK.DIALOGS.Boost.FIELDS.impacts.label",
          name: "impacts",
          value: Array.from(this.impacts),
          condition: () => this.hasFormula,
          update: v => (this.impacts = new Set(Array.isArray(v) ? v : [v].filter(Boolean))),
        }, {
          field: new FormulaField({ deterministic: false }),
          hint: "TERIOCK.DIALOGS.Boost.FIELDS.formula.hint",
          label: "TERIOCK.DIALOGS.Boost.FIELDS.formula.label",
          name: "formula",
          placeholder: "0",
          value: this.formula,
          condition: () => this.hasFormula,
          update: v => (this.formula = v),
        }, {
          field: new fields.NumberField({ min: 0 }),
          hint: "TERIOCK.DIALOGS.Boost.FIELDS.boosts.hint",
          label: "TERIOCK.DIALOGS.Boost.FIELDS.boosts.label",
          name: "boosts",
          placeholder: "0",
          small: true,
          value: this.boosts,
          condition: () => this.hasFormula,
          update: v => (this.boosts = Number(v) || 0),
        }, {
          field: new fields.NumberField({ min: 0 }),
          hint: "TERIOCK.DIALOGS.Boost.FIELDS.deboosts.hint",
          label: "TERIOCK.DIALOGS.Boost.FIELDS.deboosts.label",
          name: "deboosts",
          placeholder: "0",
          small: true,
          value: this.deboosts,
          condition: () => this.hasFormula,
          update: v => (this.deboosts = Number(v) || 0),
        }];
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
        return TERIOCK.display.icons.ui.dice;
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
          const roll = new this._RollClass(this.formula, this.rollData);
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
      async _getInput() {
        if (this.showDialog && (await this._showInputDialog()) === false) { return false; }
        return super._getInput();
      }

      /** @inheritDoc */
      async _prepareFormula() {
        await super._prepareFormula();
        this._applyImpactModifiers();
      }
    }
  );
}

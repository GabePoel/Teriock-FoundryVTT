import { rollableFormulaField } from "../../../data/fields/tools/builders.mjs";
import { HarmRoll } from "../../../dice/rolls/_module.mjs";
import { formulaExists } from "../../../helpers/formula.mjs";
import { objectMap } from "../../../helpers/utils.mjs";

const { fields } = foundry.data;

/**
 * Mixin for executions that deal an impact and can be modified with boosts, deboosts, and critical hits.
 * @template {AnyConstructor} T
 * @param {T} Base
 * @returns {MixinResult<T, ImpactsExecution & Teriock.Execution.ImpactsExecutionData>}
 */
export default function ImpactsExecutionMixin(Base) {
  /**
   * @implements {Teriock.Execution.ImpactsExecutionData}
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
        formula: rollableFormulaField(),
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
        icon: TERIOCK.display.icons.manifest.consequence.none,
        label: "TERIOCK.DIALOGS.Boost.BUTTONS.ok",
        name: "ok",
        callback: () => this.updateSource({ crit: false }),
      }, {
        action: "confirm",
        default: this.crit,
        icon: TERIOCK.display.icons.manifest.consequence.crit,
        label: "TERIOCK.DIALOGS.Boost.BUTTONS.crit",
        name: "crit",
        type: "button",
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
     * Whether to show the roll dialogs.
     * @returns {boolean}
     */
    get hasFormula() {
      return true;
    }

    /** @inheritDoc */
    get icon() {
      return super.icon ?? TERIOCK.display.icons.manifest.ui.dice;
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
      return Object.assign(super.rollOptions, { impacts: Array.from(this.impacts) });
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
        this.updateSource({ formula: roll.formula });
      }
      const setBoostNumber = (this.boosts - this.deboosts) * (this.crit ? 2 : 1);
      if (setBoostNumber !== 0) { this.updateSource({ formula: `sb(${this.formula}, ${setBoostNumber})` }); }
    }

    /**
     * @inheritDoc
     * @returns {Promise<false|void>}
     */
    async _buildActivations() {
      this.automations.addDocuments((await Promise.all(this.rolls.map(r => r.getAutomations()))).flat());
      this.automations.resetDocuments(this.automations.filter(a => a.crit.has(Number(this.crit))));
      return super._buildActivations();
    }

    /**
     * @inheritDoc
     * @returns {Promise<false|void>}
     */
    async _buildPanels() {
      await super._buildPanels();
      for (const roll of this.rolls) { this.panels.push(...(await roll.getPanels())); }
    }

    /**
     * @inheritDoc
     * @returns {Promise<false|void>}
     */
    async _buildTags() {
      await super._buildTags();
      if (this.crit) { this.tags.push(_loc("TERIOCK.DIALOGS.Boost.TAGS.crit")); }
    }

    /** @inheritDoc */
    async _postInput() {
      const boosts = Math.max(0, this.boosts - this.deboosts);
      for (const impact of this.impacts) { this._boostsResolved[impact] = boosts; }
      return super._postInput();
    }

    /**
     * @inheritDoc
     * @returns {Promise<false|void>}
     */
    async _prepareFormula() {
      await super._prepareFormula();
      this._applyImpactModifiers();
    }
  }

  return ImpactsExecution;
}

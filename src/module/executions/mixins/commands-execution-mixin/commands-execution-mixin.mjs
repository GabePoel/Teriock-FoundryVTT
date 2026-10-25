import { FormulaField } from "../../../data/fields/_module.mjs";
import { rollableFormulaField } from "../../../data/fields/tools/builders.mjs";
import { HarmRoll } from "../../../dice/rolls/_module.mjs";
import { objectMap } from "../../../utils/_module.mjs";

/**
 * @import BaseExecution from "../../abstract/base-execution/base-execution.mjs";
 */

const { fields } = foundry.data;

/**
 * Mixin for executions that deal a command and can be modified with boosts, deboosts, and critical hits.
 * @template {MixinBase<typeof BaseExecution>} T
 * @param {T} Base
 */
export default function CommandsExecutionMixin(Base) {
  /**
   * @mixin
   * @implements {Teriock.Execution.CommandsExecutionData}
   */
  class CommandsExecution
    extends /** @type {InitializedDataModel<T, Teriock.Execution.CommandsExecutionData>} */ (Base)
  {
    /** @inheritDoc */
    static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.EXECUTIONS.Boost"];

    /** @inheritDoc */
    static defineSchema() {
      return Object.assign(super.defineSchema(), {
        boosts: new fields.NumberField({ initial: 0, integer: true, min: 0, nullable: false }),
        commands: new fields.SetField(
          new fields.StringField({
            choices: objectMap(TERIOCK.CONFIG.command, i => i.numeric?.deal, {
              filter: c => c.numeric && !c.numeric.hidden,
            }),
          }),
          { initial: ["damage"] },
        ),
        crit: new fields.BooleanField(),
        deboosts: new fields.NumberField({ initial: 0, integer: true, min: 0, nullable: false }),
        formula: rollableFormulaField(),
      });
    }

    /** @inheritDoc */
    get _dialogButtons() {
      return [{
        action: "confirm",
        default: !this.crit,
        icon: TERIOCK.DISPLAY.icons.manifest.consequence.none,
        label: "TERIOCK.DIALOGS.Boost.BUTTONS.ok",
        name: "ok",
        callback: () => this.updateSource({ crit: false }),
      }, {
        action: "confirm",
        default: this.crit,
        icon: TERIOCK.DISPLAY.icons.manifest.consequence.crit,
        label: "TERIOCK.DIALOGS.Boost.BUTTONS.crit",
        name: "crit",
        type: "button",
        callback: () => this.updateSource({ crit: true }),
      }];
    }

    /** @inheritDoc */
    get _formPaths() {
      const paths = [];
      if (this.hasFormula) { paths.push("commands", "formula", "boosts", "deboosts"); }
      return [...paths, ...super._formPaths];
    }

    /** @inheritDoc */
    get _RollClass() {
      return HarmRoll;
    }

    /**
     * The single command this deals, if it only deals one. Used for the input dialog title and base roll options.
     * @returns {Teriock.Keys.Command|null}
     */
    get command() {
      if (this.commands.size === 1) { return this.commands.first(); }
      return null;
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
      return super.icon ?? TERIOCK.DISPLAY.icons.manifest.ui.dice;
    }

    /** @inheritDoc */
    get rollOptions() {
      return Object.assign(super.rollOptions, { commands: Array.from(this.commands) });
    }

    /**
     * Apply boosts, deboosts, and critical modifiers to the formula. This mirrors the logic that used to live in the
     * `boostDialog` confirmation callback.
     */
    _applyCommandModifiers() {
      if (!FormulaField.exists(this.formula)) { return; }
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
      this._dropCritMismatches();
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

    /**
     * Drop automations that don't apply to the chosen crit state.
     */
    _dropCritMismatches() {
      this.automations.resetDocuments(this.automations.filter(a => a.crit.has(Number(this.crit))));
    }

    /** @inheritDoc */
    async _postInput() {
      this._dropCritMismatches();
      const boosts = Math.max(0, this.boosts - this.deboosts);
      for (const command of this.commands) { this._boostsResolved[command] = boosts; }
      return super._postInput();
    }

    /**
     * @inheritDoc
     * @returns {Promise<false|void>}
     */
    async _prepareFormula() {
      await super._prepareFormula();
      this._applyCommandModifiers();
    }
  }

  return CommandsExecution;
}

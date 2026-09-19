import { elderSorceryCreationSchema } from "../../../data/fields/tools/builders.mjs";
import { BaseRoll, ThresholdRoll } from "../../../dice/rolls/_module.mjs";
import { addFormula } from "../../../helpers/formula.mjs";
import { DocumentExecution } from "../../abstract/_module.mjs";

const { fields } = foundry.data;

/**
 * Make the spell creation rolls for a new Elder Sorcery spell.
 *
 * Relevant wiki pages:
 * - [Elder Sorcery](https://wiki.teriock.com/index.php?title=Core:Elder_Sorcery)
 */
export default class ElderSorceryExecution extends DocumentExecution {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.EXECUTIONS.ElderSorcery"];

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      level: new fields.NumberField({ initial: 0, integer: true, min: 0, nullable: false }),
      ...elderSorceryCreationSchema(),
    });
  }

  /**
   * @param {object} [data]
   * @param {Partial<Teriock.Execution.ExecutionOptions>} [options]
   */
  constructor(data = {}, options = {}) {
    const actor = options.actor ?? options.source?.actor ?? game.actors.default;
    data = foundry.utils.mergeObject(actor?.system.elderSorceryCreation ?? {}, data, { inplace: false });
    data.level ??= actor?.system.scaling.lvl ?? 0;
    super(data, options);
  }

  /**
   * The net modifier applied to every spell creation roll.
   * @type {number}
   */
  modifier = 0;

  /** @inheritDoc */
  get _dialogButtons() {
    return [{
      action: "confirm",
      default: true,
      icon: this.icon,
      label: "TERIOCK.DIALOGS.ElderSorcery.BUTTONS.rollSpellCreation",
      name: "rollSpellCreation",
    }];
  }

  /** @inheritDoc */
  get _formPaths() {
    return ["level", "ratings", "bonuses", "penalties"];
  }

  /** @inheritDoc */
  get chatData() {
    return foundry.utils.mergeObject(super.chatData, { system: { _src: this.journalEntryPage?.uuid } });
  }

  /** @inheritDoc */
  get executionNames() {
    return [...super.executionNames, "ElderSorcery"];
  }

  /** @inheritDoc */
  get icon() {
    return TERIOCK.display.icons.manifest.ui.elderSorcery;
  }

  /** @returns {TypedIdentifier} */
  get journalEntryPageIdentifier() {
    return "core:elder-sorcery";
  }

  /** @inheritDoc */
  get name() {
    return _loc("TERIOCK.DIALOGS.ElderSorcery.title");
  }

  /** @inheritDoc */
  async _buildPanels() {
    this.panels = [
      Object.assign(await this.journalEntryPage.getPanelParts(), {
        classes: ["elder-sorcery", "es-multi"],
        collapsed: true,
        icon: this.icon,
      }),
    ];
  }

  /** @inheritDoc */
  async _buildRolls() {
    const rollData = this.getRollData();
    for (const [category, rating] of Object.entries(this.ratings)) {
      const dc = 25 + 10 * (10 - rating) - this.level;
      const roll = new ThresholdRoll(this.formula, rollData, {
        flavor: _loc("TERIOCK.DIALOGS.ElderSorcery.flavor", {
          category: _loc(this.schema.getField(`ratings.${category}`).label),
          dc,
        }),
        thresholds: this._getThresholds(dc),
      });
      this.rolls.push(roll);
    }
  }

  /**
   * Thresholds for a spell creation roll against a given DC.
   * @param {number} dc
   * @returns {Partial<Teriock.Dice.ThresholdData>[]}
   */
  _getThresholds(dc) {
    const labels = "TERIOCK.DIALOGS.ElderSorcery.OUTCOMES";
    const minorTarget = Math.max(dc, this.modifier + 3);
    const majorTarget = Math.max(dc - 25, this.modifier + 2);
    return [{ comparison: "lt", label: `${labels}.major`, level: -2, target: majorTarget, type: "roll" }, {
      comparison: "lt",
      label: `${labels}.minor`,
      level: -1,
      target: minorTarget,
      type: "roll",
    }, { comparison: "gte", level: 1, target: minorTarget, type: "roll" }];
  }

  /** @inheritDoc */
  async _prepareFormula() {
    const rollData = this.getRollData();
    let formula = "1d100";
    this.modifier = 0;
    for (const [key, raw] of [...Object.entries(this.bonuses), ...Object.entries(this.penalties)]) {
      let value = await BaseRoll.getValue(raw || "0", rollData);
      if (["assistance", "effort"].includes(key)) { value = Math.min(value, 25); }
      this.modifier += value;
      if (value) { formula = addFormula(formula, `${value}`); }
    }
    this.updateSource({ formula });
    await super._prepareFormula();
  }
}

import { FormulaField } from "../../../data/fields/_module.mjs";
import { elderSorceryCreationSchema } from "../../../data/fields/tools/builders.mjs";
import { BaseRoll, ThresholdRoll } from "../../../dice/rolls/_module.mjs";
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
   * The net modifier applied to every spell creation roll.
   * @type {number}
   */
  modifier = 0;

  /**
   * Evaluated bonus and penalty values.
   * @type {{ bonuses: Record<string, number>, penalties: Record<string, number> }}
   */
  values = { bonuses: {}, penalties: {} };

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
    return TERIOCK.DISPLAY.icons.manifest.execution.elderSorcery;
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
          rating,
        }),
        thresholds: this._getThresholds(dc),
      });
      this.rolls.push(roll);
    }
  }

  /** @inheritDoc */
  async _buildTags() {
    await super._buildTags();
    if (this.level) { this.tags.push(`${_loc(this.schema.getField("level").label)} ${this.level}`); }
    for (const [group, values] of Object.entries(this.values)) {
      for (const [key, value] of Object.entries(values)) {
        if (value) { this.tags.push(`${value.signedString()} ${_loc(this.schema.getField(`${group}.${key}`).label)}`); }
      }
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

  /**
   * @inheritDoc
   * @param {Record<string, any>} data
   * @param {Teriock.Execution.ConstructionOptions<Teriock.Execution.ExecutionOptions>} [options]
   * @returns {Record<string, any>}
   */
  _initializeSource(data, options = {}) {
    const actor = this._resolveActor(options);
    data = foundry.utils.mergeObject(actor?.system.elderSorceryCreation ?? {}, data, { inplace: false });
    data.level ??= actor?.system.scaling.lvl ?? 0;
    return super._initializeSource(data, options);
  }

  /** @inheritDoc */
  async _prepareFormula() {
    const rollData = this.getRollData();
    let formula = "1d100";
    this.modifier = 0;
    for (const group of ["bonuses", "penalties"]) {
      this.values[group] = {};
      for (const [key, raw] of Object.entries(this[group])) {
        let value = await BaseRoll.getValue(raw || "0", rollData);
        if (["assistance", "effort"].includes(key)) { value = Math.min(value, 25); }
        this.values[group][key] = value;
        this.modifier += value;
        if (value) { formula = FormulaField.add(formula, `${value}`); }
      }
    }
    this.updateSource({ formula });
    await super._prepareFormula();
  }
}

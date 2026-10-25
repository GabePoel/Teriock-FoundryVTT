import { FormulaField } from "../../data/fields/_module.mjs";
import { ThresholdRoll } from "../../dice/rolls/_module.mjs";
import { mixClasses } from "../../utils/_module.mjs";
import { BaseExecution } from "../abstract/_module.mjs";
import { ThresholdExecutionMixin } from "../mixins/_module.mjs";

/**
 * @extends {BaseExecution}
 * @mixes ThresholdExecution
 */
export default class FeatExecution extends mixClasses(BaseExecution, ThresholdExecutionMixin) {
  /**
   * The attribute of this execution.
   * @returns {Teriock.Keys.Attribute}
   */
  get attribute() {
    return this.source.key;
  }

  /** @inheritDoc */
  get chatData() {
    return foundry.utils.mergeObject(super.chatData, {
      system: { _src: game.teriock.identifiers.get(TERIOCK.CONFIG.attribute[this.attribute]?.identifier) },
    });
  }

  /** @inheritDoc */
  get executionNames() {
    return [...super.executionNames, "Feat"];
  }

  /** @inheritDoc */
  get flavor() {
    const value = TERIOCK.CONFIG.attribute[this.attribute]?.abbreviation;
    if (["number", "string"].includes(typeof this.threshold)) {
      return _loc("TERIOCK.ROLLS.Feat.thresholded", { threshold: this.threshold, value });
    }
    return _loc("TERIOCK.ROLLS.Feat.unthresholded", { value });
  }

  /** @inheritDoc */
  get icon() {
    return TERIOCK.DISPLAY.icons.manifest.attribute[this.attribute];
  }

  /** @inheritDoc */
  get journalEntryPageIdentifier() {
    return TERIOCK.CONFIG.attribute[this.attribute]?.identifier;
  }

  /** @inheritDoc */
  get name() {
    return _loc("TERIOCK.ROLLS.Feat.name", { value: TERIOCK.CONFIG.attribute[this.attribute]?.label });
  }

  /** @inheritDoc */
  get rollOptions() {
    const rollOptions = super.rollOptions;
    rollOptions.thresholds.push(...ThresholdRoll.defaultOptions.thresholds);
    return rollOptions;
  }

  /**
   * @inheritDoc
   * @returns {Promise<false|void>}
   */
  async _buildActivations() {
    if (await super._buildActivations() === false) { return false; }

    const command = TERIOCK.CONFIG.attribute[this.attribute]?.command;
    const amount = this.rolls[0]?.total;
    if (command && Number.isFinite(amount)) {
      this.activations.push(new teriock.data.pseudoDocuments.activations.TakeActivation({ amount, command }));
    }
  }

  /** @inheritDoc */
  async _buildPanels() {
    this.panels = [Object.assign(await this.journalEntryPage.getPanelParts(), { collapsed: true })];
  }

  /**
   * @inheritDoc
   * @param {Teriock.Execution.ConstructionOptions<Teriock.Execution.ThresholdExecutionOptions>} [options]
   */
  _configure(options = {}) {
    super._configure(options);
    if (this.actor) {
      this._source.bonus = FormulaField.sum(
        `2 * @${this.attribute}.score`,
        this.actor.system.attributes[this.attribute].bonus,
        this._source.bonus,
      );
    }
    if (game.settings.get("teriock", "secretAttributes").has(this.attribute)) {
      this._messageMode = options.messageMode ?? "blind";
    }
  }
}

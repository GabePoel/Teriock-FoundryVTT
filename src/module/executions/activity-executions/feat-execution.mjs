import { addFormula } from "../../helpers/formula.mjs";
import { BaseExecution } from "../abstract/_module.mjs";
import * as executionMixins from "../mixins/_module.mjs";

/**
 * @extends {BaseExecution}
 * @mixes ThresholdExecution
 */
export default class FeatExecution extends executionMixins.ThresholdExecutionMixin(BaseExecution) {
  /**
   * @param {object} [data]
   * @param {Partial<Teriock.Execution.ThresholdExecutionOptions>} [options]
   */
  constructor(data = {}, options = {}) {
    super(data, options);
    if (this.actor) {
      this.updateSource({ bonus: addFormula(this.actor.system.attributes[this.attribute].formula, this.bonus) });
    }
    if (game.settings.get("teriock", "secretAttributes").has(this.attribute)) {
      this._messageMode = options.messageMode ?? "blind";
    }
  }

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
      system: { _src: game.teriock.identifiers.get(TERIOCK.config.attribute[this.attribute]?.identifier) },
    });
  }

  /** @inheritDoc */
  get executionNames() {
    return [...super.executionNames, "Feat"];
  }

  /** @inheritDoc */
  get flavor() {
    if (this.threshold !== undefined) {
      return _loc("TERIOCK.ROLLS.Feat.thresholded", { threshold: this.threshold, value: this.attribute.toUpperCase() });
    }
    return _loc("TERIOCK.ROLLS.Feat.unthresholded", { value: this.attribute.toUpperCase() });
  }

  /** @inheritDoc */
  get icon() {
    return TERIOCK.display.icons.attribute[this.attribute];
  }

  /** @inheritDoc */
  get journalEntryPageIdentifier() {
    return TERIOCK.config.attribute[this.attribute]?.identifier;
  }

  /** @inheritDoc */
  get name() {
    return _loc("TERIOCK.ROLLS.Feat.name", { value: TERIOCK.config.attribute[this.attribute]?.label });
  }

  /** @inheritDoc */
  async _buildActivations() {
    const impact = TERIOCK.config.attribute[this.attribute]?.impact;
    const amount = this.rolls[0]?.total;
    if (impact && Number.isFinite(amount)) {
      this.activations.push(new teriock.data.pseudoDocuments.activations.TakeActivation({ amount, impact }));
    }
  }

  /** @inheritDoc */
  async _buildPanels() {
    this.panels = [await this.journalEntryPage.toPanel()];
  }
}

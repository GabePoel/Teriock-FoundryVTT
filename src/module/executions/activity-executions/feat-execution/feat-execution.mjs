import { addFormula } from "../../../helpers/formula.mjs";
import { BaseExecution } from "../../abstract/_module.mjs";
import * as executionMixins from "../../mixins/_module.mjs";

/**
 * @extends {BaseExecution}
 * @mixes ThresholdExecution
 */
export default class FeatExecution extends executionMixins.ThresholdExecutionMixin(BaseExecution) {
  /**
   * @param {Partial<Teriock.Execution.FeatExecutionOptions>} options
   */
  constructor(options = {}) {
    super(options);
    this.attribute = options.attribute;
    if (this.actor) { this.bonus = addFormula(this.actor.system.attributes[options.attribute].formula, this.bonus); }
    if (game.settings.get("teriock", "secretAttributes").has(this.attribute)) {
      this._messageMode = options.messageMode ?? "blind";
    }
  }

  /** @type {Teriock.Keys.Attribute} */
  attribute;

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
    return _loc("TERIOCK.ROLLS.Feat.name", { value: TERIOCK.reference.attributesFull[this.attribute] });
  }

  /** @inheritDoc */
  async _buildActivations() {
    const impactByAttribute = { per: "perceive", snk: "hide" };
    const impact = impactByAttribute[this.attribute];
    const amount = this.rolls[0]?.total;
    if (impact && Number.isFinite(amount)) {
      this.activations.push(new teriock.data.pseudoDocuments.activations.TakeActivation({ amount, impact }));
    }
  }

  /** @inheritDoc */
  async _buildPanels() {
    this.panels = [await this.journalEntryPage.toPanel()];
  }

  /**
   * @inheritDoc
   * @param {Teriock.Execution.FeatExecutionOptions} options
   */
  _determineCompetence(options) {
    if (this.actor) { this.competence.raw = this.actor.system.attributes[options.attribute].competence.value; }
    super._determineCompetence(options);
  }
}

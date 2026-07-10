import { getImage } from "../../../helpers/path.mjs";
import * as executionMixins from "../../mixins/_module.mjs";
import ImmunityExecution from "../immunity-execution/immunity-execution.mjs";

/**
 * @extends {BaseExecution}
 * @mixes ThresholdExecution
 */
export default class ResistanceExecution extends executionMixins.ThresholdExecutionMixin(ImmunityExecution) {
  /**
   * @param {object} [data]
   * @param {Teriock.Execution.ResistanceExecutionOptions} [options]
   */
  constructor(data = {}, options = {}) {
    super(data, options);
    if (options.threshold === undefined) { this.threshold = 10; }
    this.img = options.img
      || (this.hex ? getImage("effect-types", "Hexproof") : getImage("effect-types", "Resistance"));
  }

  /** @inheritDoc */
  get flavor() {
    return _loc("TERIOCK.ROLLS.Resist.label");
  }

  /** @inheritDoc */
  get journalEntryPageIdentifier() {
    return this.hex ? "keyword:hexproof" : "keyword:resistance";
  }

  /** @inheritDoc */
  get name() {
    if (this.hex) { return _loc("TERIOCK.TERMS.Protections.hexproof.single"); }
    return _loc("TERIOCK.TERMS.Protections.resistance.single");
  }

  /** @inheritDoc */
  async _buildActivations() {
    this.activations.push(
      new teriock.data.pseudoDocuments.activations.UseLocalActivation({ options: { lookup: "ability:resist" } }),
    );
  }

  /** @inheritDoc */
  _determineCompetence(options) {
    this.updateSource({ "competence.raw": 1 });
    super._determineCompetence(options);
  }
}

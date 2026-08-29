import * as executionMixins from "../mixins/_module.mjs";
import AffinityExecution from "./affinity-execution.mjs";

/**
 * Theoretically works for any affinity that is rolled against a threshold but is really for resistance/hexproof.
 *
 * Relevant wiki pages:
 * - [Hexproof](https://wiki.teriock.com/index.php?title=Keyword:Hexproof)
 * - [Resistance](https://wiki.teriock.com/index.php?title=Keyword:Resistance)
 *
 * @mixes ThresholdExecution
 */
export default class ResistanceExecution extends executionMixins.ThresholdExecutionMixin(AffinityExecution) {
  /**
   * @param {object} [data]
   * @param {Teriock.Execution.ResistanceExecutionOptions} [options]
   */
  constructor(data = {}, options = {}) {
    super(data, options);
    this.threshold ??= TERIOCK.config.system.resistanceThreshold;
  }

  /** @inheritDoc */
  async _buildActivations() {
    this.activations.push(
      new teriock.data.pseudoDocuments.activations.UseLocalActivation({ options: { lookup: "ability:resist" } }),
    );
  }

  /** @inheritDoc */
  _determineCompetence(options) {
    super._determineCompetence(options);
    if (options.affinity) { this.updateSource({ "competence.raw": options.affinity.competence }); }
  }
}

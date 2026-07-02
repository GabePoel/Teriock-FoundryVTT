import { DocumentExecution } from "../abstract/_module.mjs";
import * as executionMixins from "../mixins/_module.mjs";

/**
 * @extends {DocumentExecution}
 * @mixes ThresholdExecution
 * @property {TeriockFluency} source
 */
export default class FluencyExecution extends executionMixins.TradecraftExecutionMixin(DocumentExecution) {
  /** @inheritDoc */
  get tradecraft() {
    return this.source.system._source.tradecraft;
  }
}

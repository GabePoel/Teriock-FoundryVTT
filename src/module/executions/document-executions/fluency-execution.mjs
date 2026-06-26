import * as executionMixins from "../mixins/_module.mjs";
import BaseDocumentExecution from "./base-document-execution/base-document-execution.mjs";

/**
 * @extends {BaseDocumentExecution}
 * @mixes ThresholdExecution
 * @property {TeriockFluency} source
 */
export default class FluencyExecution extends executionMixins.TradecraftExecutionMixin(BaseDocumentExecution) {
  /** @inheritDoc */
  get tradecraft() {
    return this.source.system._source.tradecraft;
  }
}

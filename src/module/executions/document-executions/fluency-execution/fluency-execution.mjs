import { TradecraftExecutionMixin } from "../../mixins/_module.mjs";
import BaseDocumentExecution from "../base-document-execution/base-document-execution.mjs";

/**
 * @extends {BaseDocumentExecution}
 * @mixes ThresholdExecution
 * @property {TeriockFluency} source
 */
export default class FluencyExecution extends TradecraftExecutionMixin(BaseDocumentExecution) {
  /** @inheritDoc */
  get tradecraft() {
    return this.source.system.tradecraft;
  }
}

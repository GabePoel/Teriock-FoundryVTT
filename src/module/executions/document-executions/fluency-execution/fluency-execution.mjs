import { TradecraftExecutionMixin } from "../../mixins/_module.mjs";
import BaseDocumentExecution from "../base-document-execution/base-document-execution.mjs";

/**
 * @extends {BaseDocumentExecution}
 * @mixes ThresholdExecution
 * @property {TeriockFluency} source
 */
export default class FluencyExecution extends TradecraftExecutionMixin(
  BaseDocumentExecution,
) {
  /** @param {Teriock.Execution.DocumentExecutionOptions} options */
  constructor(options = {}) {
    super(options);
    if (options.fluent === undefined) {
      this.fluent = true;
    }
  }

  /** @inheritDoc */
  get tradecraft() {
    return this.source.system.tradecraft;
  }
}

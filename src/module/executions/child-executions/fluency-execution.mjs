import { mixClasses } from "../../helpers/construction.mjs";
import { DocumentExecution } from "../abstract/_module.mjs";
import { TradecraftExecutionMixin } from "../mixins/_module.mjs";

/**
 * @mixes TradecraftExecution
 * @property {TeriockActiveEffect<"fluency">} source
 */
export default class FluencyExecution extends mixClasses(DocumentExecution, TradecraftExecutionMixin) {
  /** @inheritDoc */
  get tradecraft() {
    return this.source.system._source.tradecraft;
  }
}

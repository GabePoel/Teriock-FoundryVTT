import { mixClasses } from "../../helpers/construction.mjs";
import BaseExecution from "../abstract/base-execution/base-execution.mjs";
import { ImpactsExecutionMixin } from "../mixins/_module.mjs";

/**
 * Execution that rolls one or more impacts.
 * @mixes ImpactsExecution
 */
export default class DealImpactExecution extends mixClasses(BaseExecution, ImpactsExecutionMixin) {
  /** @type {TeriockActiveEffect|TeriockItem|null} */
  _document;

  /** @inheritDoc */
  get _dialogDocuments() {
    const docs = super._dialogDocuments ?? [];
    if (this._document) {
      docs.unshift({
        document: this._document,
        label: _loc(`TYPES.${this._document.documentName}.${this._document.type}`),
      });
    }
    return docs;
  }

  /** @inheritDoc */
  get name() {
    if (this.impact) {
      return _loc("TERIOCK.DIALOGS.Boost.typeTitle", { type: TERIOCK.config.impact[this.impact]?.label });
    }
    return _loc("TERIOCK.DIALOGS.Boost.title");
  }

  /**
   * @inheritDoc
   * @param {Teriock.Execution.ConstructionOptions<Teriock.Execution.ImpactsExecutionOptions>} [options]
   */
  _configure(options = {}) {
    super._configure(options);
    /** @type {TeriockDocument|null} */
    this._document = options.document ?? null;
  }

  /**
   * @inheritDoc
   * @param {Record<string, any>} data
   * @param {Teriock.Execution.ConstructionOptions<Teriock.Execution.ImpactsExecutionOptions>} [options]
   * @returns {Record<string, any>}
   */
  _initializeSource(data, options = {}) {
    data.formula ??= "0";
    return super._initializeSource(data, options);
  }
}

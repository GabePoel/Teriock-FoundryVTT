import { mixClasses } from "../../helpers/construction.mjs";
import BaseExecution from "../abstract/base-execution/base-execution.mjs";
import { ImpactsExecutionMixin } from "../mixins/_module.mjs";

/**
 * Execution that rolls one or more impacts (damage, drain, healing, etc.) and offers boost/deboost/critical modifiers.
 * This replaces the standalone `boostDialog` usage in the impact chat commands.
 * @mixes ImpactsExecution
 */
export default class ImpactsExecution extends mixClasses(BaseExecution, ImpactsExecutionMixin) {
  /**
   * @param {object} [data]
   * @param {Teriock.Execution.ImpactsExecutionOptions} [options]
   */
  constructor(data = {}, options = {}) {
    data.formula ??= "0";
    super(data, options);
    this._document = options.document ?? null;
  }

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
}

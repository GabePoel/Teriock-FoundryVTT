import { mixClasses } from "../../utils/_module.mjs";
import BaseExecution from "../abstract/base-execution/base-execution.mjs";
import { CommandsExecutionMixin } from "../mixins/_module.mjs";

/**
 * Execution that rolls one or more commands.
 * @extends {BaseExecution}
 * @mixes CommandsExecution
 */
export default class DealCommandExecution extends mixClasses(BaseExecution, CommandsExecutionMixin) {
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
    if (this.command) {
      return _loc("TERIOCK.DIALOGS.Boost.typeTitle", { type: TERIOCK.CONFIG.command[this.command]?.label });
    }
    return _loc("TERIOCK.DIALOGS.Boost.title");
  }

  /**
   * @inheritDoc
   * @param {Teriock.Execution.ConstructionOptions<Teriock.Execution.CommandsExecutionOptions>} [options]
   */
  _configure(options = {}) {
    super._configure(options);
    /** @type {TeriockDocument|null} */
    this._document = options.document ?? null;
  }

  /**
   * @inheritDoc
   * @param {Record<string, any>} data
   * @param {Teriock.Execution.ConstructionOptions<Teriock.Execution.CommandsExecutionOptions>} [options]
   * @returns {Record<string, any>}
   */
  _initializeSource(data, options = {}) {
    data.formula ??= "0";
    return super._initializeSource(data, options);
  }
}

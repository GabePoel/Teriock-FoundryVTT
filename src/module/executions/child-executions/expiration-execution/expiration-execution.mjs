import { rollableFormulaField } from "../../../data/fields/tools/builders.mjs";
import { BaseExpiration } from "../../../data/pseudo-documents/expirations/abstract/_module.mjs";
import { BaseRoll } from "../../../dice/rolls/_module.mjs";
import { mixClasses } from "../../../helpers/construction.mjs";
import DocumentExecution from "../../abstract/document-execution/document-execution.mjs";
import { ThresholdExecutionMixin } from "../../mixins/_module.mjs";

/**
 * @mixes ThresholdExecution
 */
export default class ExpirationExecution extends mixClasses(DocumentExecution, ThresholdExecutionMixin) {
  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      formula: new rollableFormulaField({
        deterministic: false,
        hint: "TERIOCK.EXPIRATIONS.Base.FIELDS.roll.formula.hint",
        label: "TERIOCK.EXPIRATIONS.Base.FIELDS.roll.formula.label",
      }),
      thresholdFormula: rollableFormulaField({
        hint: "TERIOCK.EXPIRATIONS.Base.FIELDS.roll.threshold.hint",
        initial: "2d4kh1",
        label: "TERIOCK.EXPIRATIONS.Base.FIELDS.roll.threshold.label",
      }),
    });
  }

  /** @type {boolean} */
  autoExpire = false;

  /** @returns {Teriock.Execution.ExecutionDialogButtonEntry[]} */
  get _dialogButtons() {
    return [{
      action: "confirm",
      default: true,
      icon: TERIOCK.display.icons.manifest.ui.dice,
      label: "TERIOCK.EXPIRATIONS.Base.EXECUTION.roll",
      name: "roll",
    }, {
      action: "confirm",
      icon: TERIOCK.display.icons.manifest.pseudoDocument.expiration,
      label: "TERIOCK.EXPIRATIONS.Base.EXECUTION.expire",
      name: "expire",
      callback: () => (this.autoExpire = true),
    }];
  }

  /**
   * @inheritDoc
   * @remarks Intentionally does not include parent paths.
   */
  get _formPaths() {
    return ["formula", "comparison", "thresholdFormula"];
  }

  /** @inheritDoc */
  get icon() {
    return TERIOCK.display.icons.manifest.pseudoDocument.expiration;
  }

  /** @inheritDoc */
  get name() {
    if (this._expiration.type === BaseExpiration.metadata.type) { return this._expiration.label; }
    return _loc("TERIOCK.EXPIRATIONS.Base.EXECUTION.name", { label: this._expiration.label });
  }

  /**
   * @inheritDoc
   * @param {Teriock.Execution.ConstructionOptions<Teriock.Execution.ExpirationExecutionOptions>} [options]
   */
  _configure(options = {}) {
    super._configure(options);
    this.threshold = BaseRoll.minValue(this._source.thresholdFormula);
    this.automations.clear();
  }

  /**
   * @inheritDoc
   * @param {Record<string, any>} data
   * @param {Teriock.Execution.ConstructionOptions<Teriock.Execution.ExpirationExecutionOptions>} [options]
   * @returns {Record<string, any>}
   */
  _initializeSource(data, options = {}) {
    this._expiration = options.expiration ?? new BaseExpiration({ method: "roll" }, { parent: options.source.system });
    data.comparison ??= this._expiration.roll.comparison;
    data.formula ??= this._expiration.roll.formula;
    data.thresholdFormula ??= this._expiration.roll.threshold;
    return super._initializeSource(data, options);
  }

  /** @inheritDoc */
  async _postExecute() {
    if (!this.autoExpire && (this.message.rolls[0]?.product ?? 0) > 0) { this.source.system.expire(); }
    return await super._postExecute();
  }

  /** @inheritDoc */
  async _postInput() {
    if (this.autoExpire) {
      this.source.system.expire();
      return false;
    }
    return await super._postInput();
  }

  /** @inheritDoc */
  async _prepareFormula() {
    this.threshold = await BaseRoll.getValue(this.thresholdFormula, this.getRollData());
  }
}

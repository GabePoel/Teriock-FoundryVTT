import { FormulaField } from "../../../data/fields/_module.mjs";
import { BaseExpiration } from "../../../data/pseudo-documents/expirations/abstract/_module.mjs";
import { BaseRoll } from "../../../dice/rolls/_module.mjs";
import DocumentExecution from "../../abstract/document-execution.mjs";
import * as executionMixins from "../../mixins/_module.mjs";

/**
 * @extends {DocumentExecution}
 * @mixes ThresholdExecution
 */
export default class ExpirationExecution extends executionMixins.ThresholdExecutionMixin(DocumentExecution) {
  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      formula: new FormulaField({
        deterministic: false,
        hint: "TERIOCK.EXPIRATIONS.Base.FIELDS.roll.formula.hint",
        initial: "",
        label: "TERIOCK.EXPIRATIONS.Base.FIELDS.roll.formula.label",
      }),
      thresholdFormula: new FormulaField({
        hint: "TERIOCK.EXPIRATIONS.Base.FIELDS.roll.threshold.hint",
        initial: "2d4kh1",
        label: "TERIOCK.EXPIRATIONS.Base.FIELDS.roll.threshold.label",
      }),
    });
  }

  /**
   * @param {object} [data]
   * @param {Teriock.Execution.ExpirationExecutionOptions} [options]
   */
  constructor(data = {}, options = {}) {
    const expiration = options.expiration ?? new BaseExpiration({ method: "roll" }, { parent: options.source.system });
    data.comparison ??= expiration.roll.comparison;
    data.formula ??= expiration.roll.formula;
    data.thresholdFormula ??= expiration.roll.threshold;
    super(data, options);
    this.#expiration = expiration;
    this.threshold = BaseRoll.minValue(this.thresholdFormula);
  }

  /** @type {BaseExpiration} */
  #expiration;

  /** @type {boolean} */
  autoExpire = false;

  /** @inheritDoc */
  get _dialogButtons() {
    return [{
      action: "confirm",
      default: true,
      icon: TERIOCK.display.icons.ui.dice,
      label: "TERIOCK.EXPIRATIONS.Base.EXECUTION.roll",
      name: "roll",
    }, {
      action: "confirm",
      icon: TERIOCK.display.icons.pseudoDocument.expiration,
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
    return TERIOCK.display.icons.pseudoDocument.expiration;
  }

  /** @inheritDoc */
  get name() {
    if (this.#expiration.type === BaseExpiration.TYPE) { return this.#expiration.label; }
    return _loc("TERIOCK.EXPIRATIONS.Base.EXECUTION.name", { label: this.#expiration.label });
  }

  /** @inheritDoc */
  async _postExecute() {
    if (!this.autoExpire && this.message.rolls[0].success) { this.source.system.expire(); }
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

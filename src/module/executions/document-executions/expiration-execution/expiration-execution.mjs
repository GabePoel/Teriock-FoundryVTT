import { BaseExpiration } from "../../../data/pseudo-documents/expirations/abstract/_module.mjs";
import { BaseRoll } from "../../../dice/rolls/_module.mjs";
import * as executionMixins from "../../mixins/_module.mjs";
import BaseDocumentExecution from "../base-document-execution/base-document-execution.mjs";

/** @type {boolean} */
let BASE_EXPIRATION_LOCALIZED = false;

/**
 * @extends {BaseDocumentExecution}
 * @mixes ThresholdExecution
 */
export default class ExpirationExecution extends executionMixins.ThresholdExecutionMixin(BaseDocumentExecution) {
  /**
   * @param {Teriock.Execution.ExpirationExecutionOptions} options
   */
  constructor(options = {}) {
    super(options);
    if (!BASE_EXPIRATION_LOCALIZED) {
      foundry.helpers.Localization.localizeDataModel(BaseExpiration);
      BASE_EXPIRATION_LOCALIZED = true;
    }
    this.#expiration = options.expiration ?? new BaseExpiration({ method: "roll" }, { parent: this.source.system });
    this.threshold = BaseRoll.minValue(this.#expiration.roll.threshold);
    this.formula = this.#expiration.roll.formula;
    this.thresholdFormula = this.#expiration.roll.threshold;
    this.comparison = this.#expiration.roll.comparison;
  }

  /** @type {BaseExpiration} */
  #expiration;

  /** @type {boolean} */
  autoExpire = false;

  /** @type {Teriock.System.FormulaString} */
  thresholdFormula = "2d4kh1";

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

  /** @inheritDoc */
  get _dialogFields() {
    const formulaField = this.#expiration.getFieldForProperty("roll.formula");
    const comparisonField = this.#expiration.getFieldForProperty("roll.comparison");
    const thresholdField = this.#expiration.getFieldForProperty("roll.threshold");
    /** @type {Teriock.Execution.ExecutionDialogEntry[]} */
    const entries = [];
    if (formulaField) {
      entries.push({
        field: formulaField,
        hint: formulaField.hint,
        label: formulaField.label,
        name: "formula",
        placeholder: "0",
        value: this.formula,
        update: v => (this.formula = v),
      });
    }
    if (comparisonField) {
      entries.push({
        field: comparisonField,
        hint: comparisonField.hint,
        label: comparisonField.label,
        name: "comparison",
        value: this.comparison,
        update: v => (this.comparison = v),
      });
    }
    if (thresholdField) {
      entries.push({
        field: thresholdField,
        hint: thresholdField.hint,
        label: thresholdField.label,
        name: "threshold",
        placeholder: "0",
        value: this.thresholdFormula,
        update: v => (this.thresholdFormula = v),
      });
    }
    return entries;
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
    this.threshold = await BaseRoll.getValue(this.thresholdFormula, this.rollData);
  }
}

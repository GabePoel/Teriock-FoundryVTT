import { FormulaField } from "../../../data/fields/_module.mjs";
import { formulaExists, substituteFormula } from "../../../helpers/formula.mjs";
import { HackStatApplicationMixin } from "../../shared/_module.mjs";
import { DocumentDialogSheet } from "../../sheets/utility-sheets/_module.mjs";

/**
 * @extends {DocumentDialogSheet}
 * @mixes HackStatApplication
 * @property {boolean} _consumeStatDice
 * @property {boolean} _forHarm
 * @property {Teriock.System.FormulaString} _substitution
 */
export default class BaseStatManager extends HackStatApplicationMixin(DocumentDialogSheet) {
  /** @type {Partial<ApplicationConfiguration>} */
  static DEFAULT_OPTIONS = { actions: { ok: this._onDone }, classes: ["dialog"], position: { width: 425 } };

  /**
   * Close the manager.
   * @param {PointerEvent} event
   * @returns {Promise<void>}
   */
  static async _onDone(event) {
    event.preventDefault();
    await this.close();
  }

  /**
   * Rolls a stat die.
   * @param {PointerEvent} _event
   * @param {HTMLElement} target
   * @returns {Promise<void>}
   * @this {BaseStatManager}
   */
  static async _onRollStatDie(_event, target) {
    const statDie = this._getStatDie(target);
    const criticallyWounded = this.document.statuses.has("criticallyWounded");
    await statDie.use(this._consumeStatDice ?? true, { substitution: this._substitution });
    if (!criticallyWounded) { await this.document.system.takeAwaken(); }
  }

  /**
   * Creates a new stat manager instance.
   * @param {TeriockActor} actor
   * @param {Teriock.Dialog.StatDialogOptions} [options]
   * @param {object} [applicationOptions]
   */
  constructor(actor, options, applicationOptions = {}) {
    const { consumeStatDice = true, forHarm = false, substitution = "", title = "" } = options;
    if (title.length > 0) { applicationOptions.title = title; }
    Object.assign(applicationOptions, { document: actor, sheetConfig: false });
    super(applicationOptions);
    this._forHarm = forHarm;
    this._consumeStatDice = consumeStatDice;
    this._substitution = substitution;
    this._substitutionField = new FormulaField({
      deterministic: false,
      hint: _loc("TERIOCK.DIALOGS.StatManager.FIELDS.substitution.hint"),
      initial: "",
      label: _loc("TERIOCK.DIALOGS.StatManager.FIELDS.substitution.label"),
      placeholder: "@base",
    });
  }

  /**
   * Apply the dialog substitution to a stat die roll formula.
   * @param {Teriock.System.FormulaString} formula
   * @returns {Teriock.System.FormulaString}
   */
  _getStatDieRollFormula(formula) {
    return formulaExists(this._substitution) ? substituteFormula(formula, this._substitution) : formula;
  }

  /** @inheritDoc */
  _initializeApplicationOptions(options = {}) {
    const applicationOptions = super._initializeApplicationOptions(options);
    if (options.title) { applicationOptions.window.title = options.title; }
    return applicationOptions;
  }

  /** @inheritDoc */
  async _onRender(context, options) {
    await super._onRender(context, options);
    /** @type {HTMLInputElement} */
    const forHarmCheckbox = this.element.querySelector("[name='for-harm']");
    if (forHarmCheckbox) {
      forHarmCheckbox.addEventListener("change", () => {
        this._forHarm = forHarmCheckbox.checked;
      });
    }
    /** @type {HTMLInputElement} */
    const consumeDiceCheckbox = this.element.querySelector("[name='consume-dice']");
    if (consumeDiceCheckbox) {
      consumeDiceCheckbox.addEventListener("change", () => {
        this._consumeStatDice = consumeDiceCheckbox.checked;
      });
    }
    /** @type {HTMLInputElement} */
    const substitutionInput = this.element.querySelector("[name='substitution']");
    if (substitutionInput) {
      substitutionInput.addEventListener("change", () => {
        this._substitution = substitutionInput.value;
      });
    }
  }

  /** @inheritDoc */
  async _prepareContext(options = {}) {
    return Object.assign(await super._prepareContext(options), {
      consumeStatDice: this._consumeStatDice,
      consumeStatDiceField: this._consumeStatDiceField,
      forHarm: this._forHarm,
      forHarmField: this._forHarmField,
      substitution: this._substitution,
      substitutionField: this._substitutionField,
    });
  }
}

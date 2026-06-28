import { FormulaField } from "../../data/fields/_module.mjs";
import { addFormula, formulaExists } from "../../helpers/formula.mjs";
import { HackStatMixin } from "../shared/mixins/_module.mjs";
import { DocumentDialogSheet } from "../sheets/utility-sheets/_module.mjs";

/**
 * @extends {DocumentDialogSheet}
 * @mixes HackStatApplication
 * @property {boolean} _consumeStatDice
 * @property {boolean} _forHarm
 * @property {Teriock.System.FormulaString} _bonus
 */
export default class TeriockStatManager extends HackStatMixin(DocumentDialogSheet) {
  /**
   * @inheritDoc
   * @type {Partial<ApplicationConfiguration>}
   */
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
   * @this {TeriockStatManager}
   */
  static async _onRollStatDie(_event, target) {
    const statDie = this._getStatDie(target);
    const criticallyWounded = this.document.statuses.has("criticallyWounded");
    await statDie.use(this._consumeStatDice ?? true, { bonus: this._bonus });
    if (!criticallyWounded) { await this.document.system.takeAwaken(); }
  }

  /**
   * Creates a new stat manager instance.
   * @param {TeriockActor} actor
   * @param {Teriock.Dialog.StatDialogOptions} [options]
   * @param {object} [applicationOptions]
   */
  constructor(actor, options, applicationOptions = {}) {
    const { bonus = "", consumeStatDice = true, forHarm = false, title = "" } = options;
    if (title.length > 0) { applicationOptions.title = title; }
    Object.assign(applicationOptions, { document: actor, sheetConfig: false });
    super(applicationOptions);
    this._forHarm = forHarm;
    this._consumeStatDice = consumeStatDice;
    this._bonus = bonus;
    this._bonusField = new FormulaField({
      deterministic: false,
      hint: _loc("TERIOCK.DIALOGS.StatManager.FIELDS.bonus.hint"),
      initial: "",
      label: _loc("TERIOCK.DIALOGS.StatManager.FIELDS.bonus.label"),
      placeholder: "0",
    });
  }

  /**
   * Apply the dialog bonus to a stat die roll formula.
   * @param {Teriock.System.FormulaString} formula
   * @returns {Teriock.System.FormulaString}
   */
  _getStatDieRollFormula(formula) {
    return formulaExists(this._bonus) ? addFormula(formula, this._bonus) : formula;
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
    const bonusInput = this.element.querySelector("[name='bonus']");
    if (bonusInput) {
      bonusInput.addEventListener("change", () => {
        this._bonus = bonusInput.value;
      });
    }
  }

  /** @inheritDoc */
  async _prepareContext(options = {}) {
    return Object.assign(await super._prepareContext(options), {
      bonus: this._bonus,
      bonusField: this._bonusField,
      consumeStatDice: this._consumeStatDice,
      consumeStatDiceField: this._consumeStatDiceField,
      forHarm: this._forHarm,
      forHarmField: this._forHarmField,
    });
  }
}

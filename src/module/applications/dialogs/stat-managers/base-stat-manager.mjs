import { icons } from "../../../constants/display/icons.mjs";
import { FormulaField } from "../../../data/fields/_module.mjs";
import { formulaExists, substituteFormula } from "../../../helpers/formula.mjs";
import { makeIconClass } from "../../../helpers/icon.mjs";
import { DocumentDialog } from "../../api/_module.mjs";
import { HackStatApplicationMixin } from "../../shared/_module.mjs";

/**
 * @extends {DocumentDialog}
 * @mixes HackStatApplication
 */
export default class BaseStatManager extends HackStatApplicationMixin(DocumentDialog) {
  /** @type {Partial<ApplicationConfiguration>} */
  static DEFAULT_OPTIONS = {
    actions: { ok: this._onDone },
    classes: ["dialog"],
    form: { closeOnSubmit: false, submitOnChange: true },
    position: { width: 425 },
    tag: "form",
    window: { contentClasses: ["standard-form"], resizable: false },
  };

  /** @type {Record<string, HandlebarsTemplatePart>} */
  static PARTS = { footer: { template: "templates/generic/form-footer.hbs" } };

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
    await statDie.use(this.state.consumeStatDice ?? true, { substitution: this.state.substitution });
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
    this.state = { consumeStatDice, forHarm, substitution };
    this._substitutionField = new FormulaField({
      deterministic: false,
      hint: _loc("TERIOCK.DIALOGS.StatManager.FIELDS.substitution.hint"),
      initial: "",
      label: _loc("TERIOCK.DIALOGS.StatManager.FIELDS.substitution.label"),
      placeholder: "@base",
    });
  }

  /** @type {FormulaField} */
  _substitutionField;

  /**
   * Apply the dialog substitution to a stat die roll formula.
   * @param {Teriock.System.FormulaString} formula
   * @returns {Teriock.System.FormulaString}
   */
  _getStatDieRollFormula(formula) {
    return formulaExists(this.state.substitution) ? substituteFormula(formula, this.state.substitution) : formula;
  }

  /** @inheritDoc */
  _initializeApplicationOptions(options = {}) {
    const applicationOptions = super._initializeApplicationOptions(options);
    if (options.title) { applicationOptions.window.title = options.title; }
    return applicationOptions;
  }

  /** @inheritDoc */
  async _onFirstRender(context, options = {}) {
    await super._onFirstRender(context, options);
    this.element.querySelector(".form-footer button")?.focus();
  }

  /** @inheritDoc */
  async _prepareContext(options = {}) {
    return Object.assign(await super._prepareContext(options), {
      consumeStatDiceField: this._consumeStatDiceField,
      editStatBar: true,
      forHarmField: this._forHarmField,
      state: this.state,
      substitutionField: this._substitutionField,
    });
  }

  /** @inheritDoc */
  async _preparePartContext(partId, context, options) {
    context = await super._preparePartContext(partId, context, options);
    if (partId === "footer") {
      context.buttons = [{
        action: "ok",
        default: true,
        icon: makeIconClass(icons.ui.done, "button"),
        label: "TERIOCK.TERMS.Common.done",
        type: "submit",
      }];
    }
    return context;
  }
}

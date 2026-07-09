import { makeIconClass } from "../../../helpers/icon.mjs";
import { DocumentDialog } from "../../api/_module.mjs";

const { FormDataExtended } = foundry.applications.ux;

/**
 * Dialog for updating fields of a document.
 * @property {TeriockDocument} document
 */
export default class BaseUpdater extends DocumentDialog {
  /** @type {Partial<ApplicationConfiguration & Teriock.Sheet._SheetConfiguration>} */
  static DEFAULT_OPTIONS = {
    form: { closeOnSubmit: true, submitOnChange: false },
    position: { width: 450 },
    window: { contentClasses: ["standard-form"], minimizable: false, resizable: false },
  };

  /** @type {Record<string, HandlebarsTemplatePart>} */
  static PARTS = {
    form: { template: "teriock/shared/field-list-part" },
    footer: { template: "templates/generic/form-footer.hbs" },
  };

  /**
   * @inheritDoc
   * @param {Partial<ApplicationConfiguration & { TeriockDocument: document, paths?: string[] }>} options
   */
  constructor(options) {
    super(options);
    if (options.paths) { this.#dataPaths = options.paths; }
    this._currentData = {};
    for (const p of this._dataPaths) {
      foundry.utils.setProperty(
        this._currentData,
        p,
        foundry.utils.getProperty(this.document, p.replace("system.", "system._source.")),
      );
    }
    this._currentData = foundry.utils.expandObject(this._currentData);
  }

  /** @type {string[]} */
  #dataPaths = [];

  /** @type {object} */
  _currentData;

  /**
   * The paths to initially get data for.
   * @returns {string[]}
   */
  get _dataPaths() {
    return this.#dataPaths;
  }

  /**
   * The paths to display at any given time.
   * @returns {string[]}
   */
  get _formPaths() {
    return this._dataPaths;
  }

  /** @inheritDoc */
  get _titlePrefix() {
    return this.document.getFieldForProperty(this._formPaths[0])?.label ?? super._titlePrefix;
  }

  /**
   * Get the choices for a path based on some other data.
   * @param {string} path
   * @returns {object | null}
   */
  _getChoicesForPath(path) {
    return this.document.getFieldForProperty(path)?.choices;
  }

  /** @inheritDoc */
  _onChangeForm(formConfig, event) {
    super._onChangeForm(formConfig, event);
    this._currentData = foundry.utils.mergeObject(
      this._currentData,
      this._processFormData(event, this.form, new FormDataExtended(this.form)),
    );
    this.render();
  }

  /** @inheritDoc */
  async _onFirstRender(context, options = {}) {
    await super._onFirstRender(context, options);
    this.element.querySelector("button[type='submit']")?.focus();
  }

  /** @inheritDoc */
  async _preparePartContext(partId, context, options) {
    context = await super._preparePartContext(partId, context, options);
    if (partId === "form") {
      context.fields = [];
      for (const p of this._formPaths) {
        context.fields.push({
          choices: this._getChoicesForPath(p),
          field: this.document.getFieldForProperty(p),
          name: p,
          value: foundry.utils.getProperty(this._currentData, p),
        });
      }
    }
    if (partId === "footer") {
      context.buttons = [{
        default: true,
        icon: makeIconClass(TERIOCK.display.icons.ui.done),
        label: _loc("COMMON.Confirm"),
        type: "submit",
      }];
    }
    return context;
  }
}

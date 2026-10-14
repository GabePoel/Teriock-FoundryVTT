import { createElement } from "../../../helpers/html.mjs";
import { makeIconClass } from "../../../helpers/icon.mjs";
import { DocumentDialog } from "../../api/_module.mjs";

const { FormDataExtended } = foundry.applications.ux;

/**
 * @import { ApplicationConfiguration } from "@client/applications/_types.mjs";
 * @import { HandlebarsTemplatePart } from "@client/applications/api/handlebars-application.mjs";
 */

/**
 * Dialog for updating fields of a document.
 * @property {TeriockDocument} document
 */
export default class BaseUpdater extends DocumentDialog {
  /** @type {Partial<ApplicationConfiguration & Teriock.Sheet._SheetConfiguration>} */
  static DEFAULT_OPTIONS = {
    actions: { reset: this._onReset, toggleLockedPath: this._onToggleLockedPath },
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
   * Reset this updater's form values to initial values from the document's schema.
   * @this {BaseUpdater}
   */
  static async _onReset() {
    for (const p of this._dataPaths) {
      const field = this.document.getFieldForProperty(p);
      if (!field) { continue; }
      foundry.utils.setProperty(this._currentData, p, field.getInitialValue());
    }
    await this.render();
  }

  /**
   * Toggle whether a path is locked.
   * @param {MouseEvent} _event
   * @param {HTMLElement} target
   * @this {BaseUpdater}
   */
  static async _onToggleLockedPath(_event, target) {
    const path = target.dataset.path;
    const locked = target.dataset.pathLocked === "true";
    const lockedPaths = this.lockedPaths;
    if (locked) { lockedPaths.delete(path); }
    else { lockedPaths.add(path); }
    foundry.utils.setProperty(this._currentData, "system.lockedPaths", Array.from(lockedPaths));
    await this.render();
  }

  /**
   * @inheritDoc
   * @param {Partial<ApplicationConfiguration & { TeriockDocument: document, paths?: string[] }>} options
   */
  constructor(options) {
    super(options);
    if (options.paths) { this.#dataPaths = options.paths; }
    this._currentData = { system: { lockedPaths: this.document.system._source.lockedPaths } };
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
    return this.options.window.title || this.document.getFieldForProperty(this._formPaths[0])?.label
      || super._titlePrefix;
  }

  /**
   * Set of paths that are currently locked.
   * @returns {Set<string>}
   */
  get lockedPaths() {
    return new Set(foundry.utils.getProperty(this._currentData, "system.lockedPaths"));
  }

  /**
   * Get the choices for a path based on some other data.
   * @param {string} path
   * @returns {object | null}
   */
  _getChoicesForPath(path) {
    return this.document.getFieldForProperty(path)?.choices;
  }

  /**
   * Keep the current data consistent.
   */
  _normalizeCurrentData() {}

  /** @inheritDoc */
  _onChangeForm(formConfig, event) {
    super._onChangeForm(formConfig, event);
    this._currentData = foundry.utils.mergeObject(
      this._currentData,
      this._processFormData(event, this.form, new FormDataExtended(this.form)),
    );
    this._normalizeCurrentData();
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
      const inputContext = this.document.system?._inputContextKey ?? "actor";
      for (const p of this._formPaths) {
        const field = this.document.getFieldForProperty(p);
        const fieldContext = {
          choices: this._getChoicesForPath(p),
          classes: ["teriock-icon-placeholder"],
          context: inputContext,
          field,
          localize: true,
          name: p,
          value: foundry.utils.getProperty(this._currentData, p),
        };
        if (field.options?.units) { fieldContext.units = field.options?.units; }
        context.fields.push(fieldContext);
      }
    }
    if (partId === "footer") {
      context.buttons = [{
        default: true,
        icon: makeIconClass(TERIOCK.display.icons.manifest.ui.done),
        label: _loc("COMMON.Confirm"),
        type: "submit",
      }, {
        action: "reset",
        icon: makeIconClass(TERIOCK.display.icons.manifest.ui.reset),
        label: "SETTINGS.UI.ACTIONS.Reset",
        type: "button",
      }];
    }
    console.log(context);
    return context;
  }

  /** @inheritDoc */
  async _processSubmitData(event, form, submitData, options = {}) {
    options.interactive ??= true;
    foundry.utils.setProperty(submitData, "system.lockedPaths", Array.from(this.lockedPaths));
    return super._processSubmitData(event, form, submitData, options);
  }

  /** @inheritDoc */
  _replaceHTML(result, content, options) {
    const lockedPaths = this.lockedPaths;
    result.form?.querySelectorAll(".form-fields").forEach(el => {
      const path = el.querySelector("[name]")?.getAttribute("name");
      const locked = lockedPaths.has(path);
      el.append(
        createElement("button", {
          className: `icon inline-control updater-toggle ${
            makeIconClass(TERIOCK.display.icons.manifest.ui[locked ? "locked" : "unlocked"])
          }`,
          dataset: {
            action: "toggleLockedPath",
            path,
            pathLocked: locked,
            tooltip: `TERIOCK.SHEETS.Common.UPDATE.${locked ? "locked" : "unlocked"}`,
          },
        }),
      );
    });
    super._replaceHTML(result, content, options);
  }
}

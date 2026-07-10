import { icons } from "../../constants/display/icons.mjs";
import { makeIconClass } from "../../helpers/icon.mjs";
import { ResolvableDialog } from "../api/_module.mjs";
import { TeriockTextEditor } from "../ux/_module.mjs";

const { fields } = foundry.data;
const { FormDataExtended } = foundry.applications.ux;

/**
 * Select one of several choices.
 */
export default class ChoiceSelector extends ResolvableDialog {
  /** @type {Partial<ApplicationConfiguration & Teriock.Application._ApplicationConfiguration>} */
  static DEFAULT_OPTIONS = {
    actions: { confirm: this._onConfirm, other: this._onOther },
    classes: ["choice-selector"],
    form: { closeOnSubmit: false, submitOnChange: false },
    position: { width: 400 },
    tag: "form",
    window: { contentClasses: ["standard-form"], icon: makeIconClass(icons.ui.select, "title"), resizable: false },
  };

  /** @type {Record<string, HandlebarsTemplatePart>} */
  static PARTS = {
    form: { template: "teriock/dialogs/choice-selector" },
    footer: { template: "templates/generic/form-footer.hbs" },
  };

  /**
   * @returns {Promise<void>}
   * @this {ChoiceSelector}
   */
  static async _onConfirm() {
    this._finish(new FormDataExtended(this.form).get("selected"));
    await this.close();
  }

  /**
   * @returns {Promise<void>}
   * @this {ChoiceSelector}
   */
  static async _onOther() {
    this._finish(null);
    await this.close();
  }

  /**
   * @inheritDoc
   * @param {Record<string, string>} choices
   * @param {Partial<StringFieldOptions & Teriock.Select._ChoiceSelectorOptions>} [options]
   * @returns {Promise<string|null>}
   */
  static async prompt(choices, options = {}) {
    const app = new this({
      choices,
      hint: _loc("TERIOCK.DIALOGS.Select.defaults.hint"),
      hintHtml: options.hintHtml ? await TeriockTextEditor.enrichHTML(options.hintTitle) : "",
      icon: icons.ui.select,
      label: _loc("TERIOCK.DIALOGS.Select.defaults.label"),
      other: false,
      title: _loc("TERIOCK.DIALOGS.Select.defaults.title"),
      ...options,
    });
    await app.render(true);
    return app._result;
  }

  /**
   * @param {object} options
   */
  constructor(options) {
    super();
    const { hintHtml, hintTitle, icon, other, title } = options;
    this.hintHtml = hintHtml;
    this.hintTitle = hintTitle;
    this.other = other;
    this.#field = new fields.StringField(options);
    foundry.utils.mergeObject(this.options.window, { icon: makeIconClass(icon, "title"), title }, { inplace: true });
  }

  /** @type {fields.StringField} */
  #field;

  /** @inheritDoc */
  async _preparePartContext(partId, context, options) {
    context = await super._preparePartContext(partId, context, options);
    if (partId === "form") {
      context.fields = [{ field: this.#field, name: "selected", value: this.#field.initial }];
      context.hintHtml = this.hintHtml;
      context.hintTitle = this.hintTitle;
    }
    if (partId === "footer") {
      /** @type {object[]} */
      const buttons = [{
        action: "confirm",
        default: true,
        icon: makeIconClass(icons.ui.done, "button"),
        label: "COMMON.Confirm",
        type: "submit",
      }];
      if (this.other) {
        buttons.push({
          action: "other",
          icon: makeIconClass(icons.ui.custom, "button"),
          label: _loc("TERIOCK.DIALOGS.Select.otherButton"),
        });
      }
      context.buttons = buttons;
    }
    return context;
  }
}

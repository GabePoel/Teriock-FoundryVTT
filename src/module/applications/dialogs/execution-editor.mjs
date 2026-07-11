import { FormulaField } from "../../data/fields/_module.mjs";
import { makeIconClass } from "../../helpers/icon.mjs";
import { ResolvableDialog } from "../api/_module.mjs";
import DocumentSelector from "./document-selector.mjs";

const { FormDataExtended } = foundry.applications.ux;
const { fields } = foundry.data;

export default class ExecutionEditor extends ResolvableDialog {
  /**
   * Change the message mode.
   * @param {PointerEvent} _event
   * @param {HTMLButtonElement} target
   * @returns {Promise<void>}
   * @this {ExecutionEditor}
   */
  static async #onMessageMode(_event, target) {
    this.execution._messageMode = target.dataset.mode;
    await this.render();
  }

  /** @type {Partial<ApplicationConfiguration>} */
  static DEFAULT_OPTIONS = {
    actions: { changeDocument: this._onChangeDocument, confirm: this._onConfirm, messageMode: this.#onMessageMode },
    classes: ["execution-editor"],
    form: { closeOnSubmit: false, submitOnChange: false },
    position: { width: 550 },
    tag: "form",
    window: { contentClasses: ["wide-toggles"] },
  };

  /** @type {Record<string, HandlebarsTemplatePart>} */
  static PARTS = {
    content: { template: "teriock/dialogs/execution-editor" },
    messageModes: { template: "teriock/ui/message-modes" },
    footer: { template: "templates/generic/form-footer.hbs" },
  };

  /**
   * @param {PointerEvent} event
   * @param {HTMLElement} target
   * @returns {Promise<void>}
   */
  static async _onChangeDocument(event, target) {
    event?.preventDefault();
    const control = /** @type {HTMLElement} */ target?.closest("[data-document-index]");
    const index = Number(control?.dataset.documentIndex);
    /** @type {Teriock.Execution.ExecutionDialogDocument} */
    const entry = this.execution._dialogDocuments[index];
    if (!entry?.editable || typeof entry.getChoices !== "function") { return; }
    const choices = await entry.getChoices();
    const selected = await DocumentSelector.selectSingle(choices, {
      auto: false,
      checked: entry.document?.uuid,
      hint: _loc(entry.selectHint ?? "TERIOCK.DIALOGS.Select.Armament.hint"),
      openable: true,
      textKey: this.execution?.source?.system?.interaction === "attack"
        ? "system.summarizedAttack"
        : this.execution?.source?.system?.interaction === "block"
        ? "system.summarizedBlock"
        : null,
      title: _loc(entry.selectTitle ?? "TERIOCK.DIALOGS.Select.Armament.title"),
    });
    if (selected === null) { return; }
    if (typeof entry.update === "function") { await entry.update(selected); }
    await this.render();
  }

  /**
   * @param {PointerEvent} event
   * @param {HTMLButtonElement} target
   * @returns {Promise<void>}
   * @this {ExecutionEditor}
   */
  static async _onConfirm(event, target) {
    event?.preventDefault();
    const name = target?.name;
    const button = this.execution._dialogButtons.find(b => b.name === name);
    if (button?.callback) { button.callback(); }
    this._finish(true);
    await this.close();
  }

  /**
   * @param {AbilityExecution|ThresholdExecution} execution
   * @param {Partial<ApplicationConfiguration>} [config]
   */
  constructor(execution, config = {}) {
    super(config);
    this.execution = execution;
    foundry.utils.setProperty(
      this.options,
      "window.title",
      _loc("TERIOCK.DIALOGS.ThresholdExecutionOptions.title", {
        name: execution.name,
        use: _loc("TERIOCK.DIALOGS.ThresholdExecutionOptions.use"),
      }).trim(),
    );
    foundry.utils.setProperty(this.options, "window.icon", makeIconClass(execution.icon, "title"));
  }

  /**
   * Build the render context for a single execution schema field.
   * @param {string} path
   * @returns {object}
   */
  #prepareFieldContext(path) {
    const field = this.execution.schema.getField(path);
    const small = field instanceof fields.BooleanField;
    const numeric = field instanceof FormulaField || (field instanceof fields.NumberField && !field.choices);
    return {
      classes: small ? "slim tgrid-item" : undefined,
      field,
      localize: true,
      name: path,
      placeholder: numeric ? "0" : undefined,
      small,
      value: foundry.utils.getProperty(this.execution._source, path),
    };
  }

  /** @inheritDoc */
  _onChangeForm(formConfig, event) {
    super._onChangeForm(formConfig, event);
    const form = /** @type {HTMLFormElement} */ (event.currentTarget);
    const submitted = new FormDataExtended(form).object;
    const changes = {};
    for (const path of this.execution._formPaths) {
      if (path in submitted) { changes[path] = submitted[path]; }
    }
    this.execution.updateSource(changes);
    this.render();
  }

  /** @inheritDoc */
  async _onFirstRender(context, options = {}) {
    await super._onFirstRender(context, options);
    const btn = this.execution._dialogButtons.find(d => d.default);
    if (btn && btn.name) {
      /** @type {HTMLButtonElement} */
      const btnEl = this.element.querySelector(`.form-footer button[name=${btn.name}]`);
      if (btnEl) { btnEl.focus(); }
    }
  }

  /** @inheritDoc */
  async _onRender(context, options = {}) {
    await super._onRender(context, options);
    this.element.querySelectorAll(".teriock-block[data-uuid]").forEach(/** @param {HTMLElement} el */ el => {
      const uuid = el.dataset.uuid;
      fromUuid(uuid).then(doc => doc?.onEmbed(el));
    });
  }

  /** @inheritDoc */
  async _prepareContext(options = {}) {
    const mainFields = [];
    const smallFields = [];
    for (const path of this.execution._formPaths) {
      if (path === "hr") { continue; }
      const fieldContext = this.#prepareFieldContext(path);
      if (fieldContext.small) { smallFields.push(fieldContext); }
      else { mainFields.push(fieldContext); }
    }
    const multipleDocuments = this.execution._dialogDocuments.length > 1;
    const documents = this.execution._dialogDocuments.map((entry, index) => {
      return {
        document: entry.document,
        editable: entry.editable,
        index,
        label: entry.label,
        showFooter: entry.editable || (multipleDocuments && Boolean(entry.label)),
        showLabel: multipleDocuments,
      };
    });
    return Object.assign(await super._prepareContext(options), {
      buttons: this.execution._dialogButtons.map(button => ({
        type: "submit",
        ...button,
        icon: makeIconClass(button.icon || this.execution.icon, "button"),
        label: _loc(button.label),
      })),
      documents,
      mainFields,
      messageModes: Object.entries(CONFIG.ChatMessage.modes).map(([action, { icon, label }]) => {
        return { action, active: action === this.execution._messageMode, icon, label };
      }),
      smallFields,
    });
  }
}

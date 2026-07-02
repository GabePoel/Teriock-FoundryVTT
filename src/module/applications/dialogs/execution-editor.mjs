import { makeIconClass } from "../../helpers/icon.mjs";
import ResolvableDialog from "../api/resolvable-dialog.mjs";
import DocumentSelector from "./document-selector.mjs";

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

  /**
   * @inheritDoc
   * @type {Partial<ApplicationConfiguration>}
   */
  static DEFAULT_OPTIONS = {
    actions: { changeDocument: this._onChangeDocument, confirm: this._onConfirm, messageMode: this.#onMessageMode },
    classes: ["execution-editor"],
    position: { width: 550 },
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
   * Bind embed listeners for document blocks.
   */
  #bindBlockListeners() {
    this.element.querySelectorAll(".teriock-block[data-uuid]").forEach(/** @param {HTMLElement} el */ el => {
      const uuid = el.dataset.uuid;
      fromUuid(uuid).then(doc => doc?.onEmbed(el));
    });
  }

  /**
   * Bind live update listeners for execution dialog fields.
   */
  #bindFieldListeners() {
    for (const field of this.execution._activeDialogFields) {
      const element = /** @type {HTMLInputElement} */ (this.element.querySelector(`[name="${field.name}"]`));
      if (!element) { continue; }
      element.addEventListener("change", async () => {
        field.update(this.#readFieldValue(field, element));
        await this.render();
      });
    }
  }

  /**
   * @param {Teriock.Execution.ExecutionDialogEntry} field
   * @param {object} [options]
   * @param {boolean} [options.small]
   * @returns {object}
   */
  #prepareFieldContext(field, { small = false } = {}) {
    return {
      classes: [...(field.classes ?? []), small ? "tgrid-item" : null].filterJoin(" "),
      field: field.field,
      hint: field.hint ? _loc(field.hint) : undefined,
      integer: field.integer,
      label: _loc(field.label),
      max: field.max,
      min: field.min,
      name: field.name,
      placeholder: field.placeholder,
      value: field.value,
    };
  }

  /**
   * @param {Teriock.Execution.ExecutionDialogEntry} field
   * @param {HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement} element
   */
  #readFieldValue(field, element) {
    if (field.field instanceof fields.BooleanField) { return element.checked; }
    if (field.field instanceof fields.NumberField) { return Number(element.value); }
    return element.value;
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
    this.#bindBlockListeners();
    this.#bindFieldListeners();
  }

  /** @inheritDoc */
  async _prepareContext(options = {}) {
    const mainFields = [];
    const smallFields = [];
    for (const field of this.execution._activeDialogFields) {
      if (field.small) { smallFields.push(this.#prepareFieldContext(field, { small: true })); }
      else { mainFields.push(this.#prepareFieldContext(field)); }
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
        ...button,
        icon: makeIconClass(button.icon || this.execution.icon, "button"),
        label: _loc(button.label),
        type: "submit",
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

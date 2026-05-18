import { icons } from "../../../constants/display/icons.mjs";
import { makeIconClass, objectMap } from "../../../helpers/utils.mjs";
import DocumentDialogSheet from "./document-dialog-sheet.mjs";

export default class DocumentSettingsSheet extends DocumentDialogSheet {
  /**
   * Reset to the default identifier.
   * @returns {Promise<void>}
   */
  static async #resetIdentifier() {
    await this.document.update({
      "system.identifier": this.document.defaultIdentifier,
    });
  }
  /** @inheritDoc */
  static DEFAULT_OPTIONS = {
    actions: { resetIdentifier: this.#resetIdentifier },
    form: { closeOnSubmit: false, submitOnChange: true },
    position: { width: 650 },
    window: {
      contentClasses: ["standard-form", "teriock-settings"],
      icon: makeIconClass(icons.ui.configure, "title"),
      resizable: true,
    },
  };

  /** @inheritDoc */
  static PARTS = {
    all: {
      scrollable: [""],
      template: "teriock/sheets/utility/document-config",
    },
  };

  /**
   * Configure a normal field.
   * @param {string} path
   * @param {object} [options]
   * @param {string} [options.hint]
   * @param {string} [options.label]
   * @param {string} [options.placeholder]
   * @returns {{field: DataField, value: *, localize: boolean}}
   */
  #quickNormalField(path, options = {}) {
    return {
      field: this.document.getSchema(path),
      hint: options?.hint,
      label: options?.label,
      localize: true,
      placeholder: options?.placeholder,
      value: foundry.utils.getProperty(this.document, path),
    };
  }

  /**
   * Configure a setting field.
   * @param {string} path
   * @param {object} [options]
   * @param {string} [options.hint]
   * @param {string} [options.label]
   * @param {string} [options.placeholder]
   * @returns {{field: DataField, value: *, localize: boolean}}
   */
  #quickSettingsField(path, options = {}) {
    return {
      field: this.document.flags?.teriockDocumentSettings?.schema?.getField(path),
      hint: options?.hint,
      label: options?.label,
      localize: true,
      name: `flags.teriockDocumentSettings.${path}`,
      placeholder: options?.placeholder,
      value: this.document?.getSetting(path),
    };
  }

  /** @inheritDoc */
  get _titlePrefix() {
    return "TERIOCK.SYSTEMS.Common.MENU.configureDocument";
  }

  /** @inheritDoc */
  async _onRender(context, options) {
    await super._onRender(context, options);
    // TODO: Eventually this identifier button logic should be moved into a custom identifier HTML element.
    /** @type {HTMLInputElement} */
    const identifierInput = this.element.querySelector('input[name="system.identifier"]');
    /** @type {HTMLDivElement} */
    const formFields = identifierInput.closest(".form-fields");
    formFields.style.gap = "0.25rem";
    if (identifierInput) {
      const button = document.createElement("button");
      button.className = "icon";
      button.style.flexBasis = "36px";
      button.classList.add(...makeIconClass(TERIOCK.display.icons.ui.reset, "button").split(" "));
      button.dataset.tooltip = _loc("TERIOCK.SHEETS.DocumentSettings.BUTTONS.resetIdentifier");
      button.dataset.action = "resetIdentifier";
      identifierInput.after(button);
    }
  }

  /** @inheritDoc */
  async _prepareContext(options = {}) {
    const context = await super._prepareContext(options);
    context.configs = [];
    const hasCompendiumSource =
      !!this.document._stats &&
      (!!this.document._stats?.compendiumSource || this.document._stats?.compendiumSource === null);
    if (hasCompendiumSource && !this.document.isSecret) {
      context.configs.push({
        fields: [
          this.#quickNormalField("system.identifier", {
            placeholder: this.document.defaultIdentifier,
          }),
          this.#quickNormalField("_stats.compendiumSource", {
            hint: "TERIOCK.SHEETS.DocumentSettings.FIELDS.compendiumSource.hint",
            label: "TERIOCK.SHEETS.DocumentSettings.FIELDS.compendiumSource.label",
          }),
        ],
        legend: "TERIOCK.SHEETS.DocumentSettings.FIELDS.sources.legend",
        localize: true,
      });
    }
    const hasQualifiers = !!this.document.system?.qualifiers;
    if (hasQualifiers) {
      context.configs.push({
        fields: [
          this.#quickNormalField("system.qualifiers.ephemeral.raw"),
          this.#quickNormalField("system.qualifiers.suppressed.raw"),
        ],
        legend: "TERIOCK.SHEETS.DocumentSettings.FIELDS.qualifiers.legend",
        localize: true,
      });
    }
    const hasSettings = !!this.document.flags.teriockDocumentSettings;
    if (hasSettings) {
      const schema = this.document.flags.teriockDocumentSettings.schema;
      for (const field of Object.values(schema.fields)) {
        if (field instanceof foundry.data.fields.SchemaField) {
          context.configs.push({
            fields: objectMap(field.fields, f => this.#quickSettingsField(f.fieldPath)),
            legend: field.label,
            localize: true,
          });
        }
      }
    }
    return context;
  }
}

import { icons } from "../../../constants/display/icons.mjs";
import { makeIconClass } from "../../../helpers/utils.mjs";
import DocumentDialogSheet from "./document-dialog-sheet.mjs";

export default class DocumentSettingsSheet extends DocumentDialogSheet {
  /** @type {Partial<ApplicationConfiguration & Teriock.Sheet._SheetConfiguration>} */
  static DEFAULT_OPTIONS = {
    form: { closeOnSubmit: false, submitOnChange: true },
    position: { width: 650 },
    window: {
      contentClasses: ["standard-form", "teriock-settings"],
      icon: makeIconClass(icons.ui.configure, "title"),
      resizable: true,
    },
  };

  /** @type {Record<string, HandlebarsTemplatePart>} */
  static PARTS = { all: { scrollable: [""], template: "teriock/sheets/utility/document-config" } };

  /**
   * Configure a field.
   * @param {string} path
   * @param {object} [options]
   * @param {string} [options.hint]
   * @param {string} [options.label]
   * @param {string} [options.placeholder]
   * @param {string|null} [options.reset]
   * @returns {{field: DataField, value: *, localize: boolean}}
   */
  #quickField(path, options = {}) {
    const { hint, label, localize = true, placeholder, reset } = options;
    return {
      field: this.document.getFieldForProperty(path),
      hint,
      label,
      localize,
      placeholder,
      reset,
      value: foundry.utils.getProperty(this.document, path),
    };
  }

  /**
   * Configure a field on this document's embedded settings model.
   * @param {DataField} schemaField
   * @param {string} [parentPath]
   * @returns {{field: DataField, value: *, localize: boolean, name: string}}
   */
  #settingsField(schemaField, parentPath = "") {
    const settingsRoot = this.document.system.settings.schema.fieldPath;
    const relativePath = parentPath ? `${parentPath}.${schemaField.name}` : schemaField.name;
    const path = `${settingsRoot}.${relativePath}`;
    return {
      field: schemaField,
      hint: schemaField.hint,
      label: schemaField.label,
      localize: true,
      name: path,
      value: foundry.utils.getProperty(this.document, path),
    };
  }

  /**
   * Legend for this document's settings fieldset.
   * @returns {string|undefined}
   */
  #settingsLegend() {
    const category = this.document.system.settings?.constructor?.CATEGORY;
    return category ? `TERIOCK.SETTINGS.${category}.name` : undefined;
  }

  /** @inheritDoc */
  get _titlePrefix() {
    return "TERIOCK.SYSTEMS.Common.MENU.configureDocument";
  }

  /** @inheritDoc */
  async _prepareContext(options = {}) {
    const context = await super._prepareContext(options);
    context.configs = [];
    const hasCompendiumSource = Boolean(this.document._stats)
      && (Boolean(this.document._stats?.compendiumSource) || this.document._stats?.compendiumSource === null);
    if (hasCompendiumSource && !this.document.isSecret) {
      context.configs.push({
        fields: [
          this.#quickField("system.identifier", {
            placeholder: this.document.defaultIdentifier,
            reset: this.document.defaultIdentifier,
          }),
          this.#quickField("_stats.compendiumSource", {
            hint: "TERIOCK.SHEETS.DocumentSettings.FIELDS.compendiumSource.hint",
            label: "TERIOCK.SHEETS.DocumentSettings.FIELDS.compendiumSource.label",
          }),
        ],
        legend: "TERIOCK.SHEETS.DocumentSettings.FIELDS.sources.legend",
        localize: true,
      });
    }
    if (this.document.system?.settings) {
      const schema = this.document.system.settings.schema;
      const settingsFields = Object.values(schema.fields).filter(field =>
        !(field instanceof foundry.data.fields.SchemaField)
      ).map(field => this.#settingsField(field));
      if (settingsFields.length) {
        context.configs.push({ fields: settingsFields, legend: this.#settingsLegend(), localize: true });
      }
      for (const field of Object.values(schema.fields)) {
        if (field instanceof foundry.data.fields.SchemaField) {
          context.configs.push({
            fields: Object.values(field.fields).map(f => this.#settingsField(f, field.name)),
            legend: field.label,
            localize: true,
          });
        }
      }
    }
    return context;
  }
}

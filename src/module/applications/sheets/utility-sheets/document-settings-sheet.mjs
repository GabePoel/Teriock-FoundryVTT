import { icons } from "../../../constants/display/icons.mjs";
import { makeIconClass, objectMap } from "../../../helpers/utils.mjs";
import DocumentDialogSheet from "./document-dialog-sheet.mjs";

export default class DocumentSettingsSheet extends DocumentDialogSheet {
  /** @inheritDoc */
  static DEFAULT_OPTIONS = {
    form: { closeOnSubmit: false, submitOnChange: true },
    position: { width: 650 },
    window: {
      contentClasses: ["standard-form", "teriock-settings"],
      icon: makeIconClass(icons.ui.configure, "title"),
      resizable: true,
    },
  };

  /** @inheritDoc */
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
      for (const field of Object.values(schema.fields)) {
        if (field instanceof foundry.data.fields.SchemaField) {
          context.configs.push({
            fields: objectMap(field.fields, f => this.#quickField(f.fieldPath)),
            legend: field.label,
            localize: true,
          });
        }
      }
    }
    return context;
  }
}

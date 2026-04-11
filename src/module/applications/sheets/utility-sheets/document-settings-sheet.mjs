import { icons } from "../../../constants/display/icons.mjs";
import { makeIconClass, objectMap } from "../../../helpers/utils.mjs";
import TeriockDocumentSheet from "./document-sheet.mjs";

export default class DocumentSettingsSheet extends TeriockDocumentSheet {
  /** @inheritDoc */
  static DEFAULT_OPTIONS = {
    form: { closeOnSubmit: false, submitOnChange: true },
    position: { width: 650 },
    window: {
      contentClasses: ["standard-form", "teriock-settings"],
      resizable: true,
      icon: makeIconClass(icons.ui.configure, "title"),
    },
  };
  /** @inheritDoc */
  static PARTS = {
    all: {
      template: "teriock/sheets/utility/document-config",
      scrollable: [""],
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
      field:
        this.document.flags?.teriockDocumentSettings?.schema?.getField(path),
      hint: options?.hint,
      label: options?.label,
      localize: true,
      name: `flags.teriockDocumentSettings.${path}`,
      placeholder: options?.placeholder,
      value: this.document?.getSetting(path),
    };
  }

  /** @inheritDoc */
  async _prepareContext(options = {}) {
    const context = await super._prepareContext(options);
    context.configs = [];
    const hasCompendiumSource =
      !!this.document._stats &&
      (!!this.document._stats?.compendiumSource ||
        this.document._stats?.compendiumSource === null);
    if (hasCompendiumSource && !this.document.isSecret) {
      context.configs.push({
        legend: "TERIOCK.SHEETS.DocumentSettings.FIELDS.sources.legend",
        localize: true,
        fields: [
          this.#quickNormalField("system.identifier"),
          this.#quickNormalField("_stats.compendiumSource", {
            hint: "TERIOCK.SHEETS.DocumentSettings.FIELDS.compendiumSource.hint",
            label:
              "TERIOCK.SHEETS.DocumentSettings.FIELDS.compendiumSource.label",
          }),
        ],
      });
    }
    const hasQualifiers = !!this.document.system?.qualifiers;
    if (hasQualifiers) {
      context.configs.push({
        legend: "TERIOCK.SHEETS.DocumentSettings.FIELDS.qualifiers.legend",
        localize: true,
        fields: [
          this.#quickNormalField("system.qualifiers.ephemeral.raw"),
          this.#quickNormalField("system.qualifiers.suppressed.raw"),
        ],
      });
    }
    const hasSettings = !!this.document.flags.teriockDocumentSettings;
    if (hasSettings) {
      const schema = this.document.flags.teriockDocumentSettings.schema;
      for (const field of Object.values(schema.fields)) {
        if (field instanceof foundry.data.fields.SchemaField) {
          context.configs.push({
            legend: field.label,
            localize: true,
            fields: objectMap(field.fields, (f) =>
              this.#quickSettingsField(f.fieldPath),
            ),
          });
        }
      }
    }
    return context;
  }
}

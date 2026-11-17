import { makeIconClass } from "../../../utils/_module.mjs";
import { DocumentDialog } from "../../api/_module.mjs";

/**
 * @import { ApplicationConfiguration } from "@client/applications/_types.mjs";
 * @import { HandlebarsTemplatePart } from "@client/applications/api/handlebars-application.mjs";
 * @import { DataField } from "@common/data/fields.mjs";
 */

export default class DocumentSettingsSheet extends DocumentDialog {
  /** @type {Partial<ApplicationConfiguration & Teriock.Sheet._SheetConfiguration>} */
  static DEFAULT_OPTIONS = {
    form: { closeOnSubmit: true, submitOnChange: false },
    position: { width: 650 },
    window: {
      contentClasses: ["standard-form", "teriock-settings"],
      icon: makeIconClass(TERIOCK.DISPLAY.icons.manifest.ui.configure, "title"),
      resizable: true,
    },
  };

  /** @type {Record<string, HandlebarsTemplatePart>} */
  static PARTS = {
    all: { scrollable: [""], template: "teriock/sheets/utility/document-settings-sheet" },
    footer: { template: "templates/generic/form-footer.hbs" },
  };

  /**
   * Configure a field.
   * @param {string} path
   * @param {object} [options]
   * @param {string|null} [options.generate]
   * @param {string} [options.hint]
   * @param {string} [options.label]
   * @param {string} [options.placeholder]
   * @returns {{field: DataField, value: *, localize: boolean}}
   */
  #quickField(path, options = {}) {
    const { generate, hint, label, localize = true, placeholder } = options;
    return {
      field: this.document.getFieldForProperty(path),
      generate,
      hint,
      label,
      localize,
      name: path,
      placeholder,
      value: foundry.utils.getProperty(this.document._source, path),
    };
  }

  /**
   * Configure a field on this document's embedded settings model.
   * @param {DataField} schemaField
   * @returns {{field: DataField, value: *, localize: boolean, name: string}}
   * @category Behavior
   */
  #settingsField(schemaField) {
    const path = schemaField.fieldPath;
    return {
      field: schemaField,
      hint: schemaField.hint,
      label: schemaField.label,
      localize: true,
      name: path,
      value: foundry.utils.getProperty(this.document._source, path),
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
          this.#quickField("system.slug", {
            generate: this.document.constructor.getIdentifierSlug({ name: this.document.name }),
            placeholder: this.document.constructor.getIdentifierSlug({ name: this.document.name }),
          }),
          this.#quickField("_stats.compendiumSource"),
          this.#quickField("_stats.duplicateSource"),
        ],
        icon: TERIOCK.DISPLAY.icons.manifest.ui.compendium,
        label: "TERIOCK.SHEETS.DocumentSettings.FIELDS.sources.legend",
        localize: true,
      });
    }
    const settingsFields = Object.values(this.document.system?.settings?.schema.fields ?? {});
    if (settingsFields.length) {
      context.configs.push({
        fields: settingsFields.map(field => this.#settingsField(field)),
        icon: TERIOCK.DISPLAY.icons.manifest.settings.documentBehavior,
        label: "TERIOCK.SHEETS.DocumentSettings.FIELDS.behavior.legend",
        localize: true,
      });
    }
    const useFieldset = context.configs.length > 1;
    context.configs = context.configs.map(config => ({ ...config, fieldset: useFieldset }));
    return context;
  }
}

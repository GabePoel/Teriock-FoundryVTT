import { makeIconClass } from "../../../helpers/utils.mjs";

const { DocumentSheetV2, HandlebarsApplicationMixin } =
  foundry.applications.api;

/**
 * @extends {DocumentSheetV2}
 * @mixes HandlebarsApplicationMixin
 */
export default class DocumentSettingsSheet extends HandlebarsApplicationMixin(
  DocumentSheetV2,
) {
  /** @inheritDoc */
  static DEFAULT_OPTIONS = {
    form: {
      closeOnSubmit: false,
      submitOnChange: true,
    },
    position: {
      width: 600,
      height: 500,
    },
    window: {
      resizable: true,
      icon: makeIconClass("gear-code", "title"),
    },
  };
  /** @inheritDoc */
  static PARTS = {
    all: {
      template:
        "systems/teriock/src/templates/document-templates/utility-templates/document-settings-template.hbs",
      scrollable: [""],
    },
  };

  /** @inheritDoc */
  async _prepareContext(options = {}) {
    const context = await super._prepareContext(options);
    const sheetSettings = {};
    const otherSettings = {};
    Object.entries(this.document.flags.teriockDocumentSettings).forEach(
      ([key, value]) => {
        if (key.startsWith("sheet")) {
          sheetSettings[key] = value;
        } else {
          otherSettings[key] = value;
        }
      },
    );
    Object.assign(context, {
      hasQualifiers: !!this.document.system?.qualifiers,
      hasCompendiumSource:
        !!this.document._stats &&
        (!!this.document._stats?.compendiumSource ||
          this.document._stats?.compendiumSource === null),
      sheetSettings,
      otherSettings,
      hasSheetSettings: Object.keys(sheetSettings).length > 0,
      hasOtherSettings: Object.keys(otherSettings).length > 0,
      id: this.id,
    });
    return context;
  }
}

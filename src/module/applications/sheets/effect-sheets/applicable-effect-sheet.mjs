import { icons } from "../../../constants/display/icons.mjs";
import { mixClasses } from "../../../helpers/construction.mjs";
import { makeIconClass } from "../../../helpers/icon.mjs";
import { omit } from "../../../helpers/utils.mjs";
import { BaseDocumentSheetMixin } from "../../api/_module.mjs";
import * as sheetMixins from "../mixins/_module.mjs";

const { ActiveEffectConfig } = foundry.applications.sheets;

/**
 * {@link TeriockImbuement} and {@link TeriockConsequence} sheet.
 * @property {TeriockConsequence} document
 * @extends {ActiveEffectConfig}
 * @mixes MechanicsSheet
 */
export default class ApplicableEffectSheet
  extends mixClasses(
    ActiveEffectConfig,
    BaseDocumentSheetMixin,
    sheetMixins.SystemSettingsButtonSheetMixin,
    sheetMixins.ConnectionSheetMixin,
    sheetMixins.DocumentCreationSheetMixin,
    sheetMixins.DragDropSheetMixin,
    sheetMixins.FieldsSheetMixin,
    sheetMixins.LockingSheetMixin,
    sheetMixins.MechanicsSheetMixin,
    sheetMixins.PreviewSheetMixin,
  )
{
  /** @type {Partial<ApplicationConfiguration & Teriock.Sheet._SheetConfiguration>} */
  static DEFAULT_OPTIONS = { form: { closeOnSubmit: false, submitOnChange: true } };

  /** @type {Record<string, HandlebarsTemplatePart>} */
  static PARTS = {
    ...omit(super.PARTS, ["footer"]),
    header: { template: "teriock/sheets/shared/top" },
    children: { scrollable: [""], template: "teriock/sheets/effects/consequence/children-tab" },
    mechanics: {
      scrollable: [""],
      template: "teriock/sheets/effects/consequence/mechanics-tab",
      templates: ["templates/generic/tab-navigation.hbs"],
    },
  };

  /** @type {Record<string, Partial<ApplicationTabsConfiguration>>} */
  static TABS = {
    sheet: {
      initial: super.TABS.sheet.initial,
      labelPrefix: super.TABS.sheet.labelPrefix,
      tabs: [...super.TABS.sheet.tabs, { icon: makeIconClass(icons.ui.document, "solid"), id: "children" }, {
        icon: makeIconClass(icons.pseudoDocument.mechanic, "solid"),
        id: "mechanics",
      }],
    },
  };

  constructor(...args) {
    super(...args);
    this._locked = false;
  }

  #editorForms;

  /** @inheritDoc */
  async _prepareContext(context = {}) {
    if (this.document.system._formPaths.length) {
      this.#editorForms = await this.document.system._getEditorForms({ rootId: this.id });
    }
    return super._prepareContext(context);
  }

  /** @inheritDoc */
  _replaceHTML(result, content, options) {
    if (this.#editorForms) {
      const disabledGroup = result.details?.querySelector(".form-group:has(.form-fields input[name='disabled'])");
      if (disabledGroup) { disabledGroup.after(this.#editorForms); }
    }
    super._replaceHTML(result, content, options);
  }
}

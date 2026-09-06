import { icons } from "../../../constants/display/_module.mjs";
import { mixClasses } from "../../../helpers/construction.mjs";
import { makeIconClass } from "../../../helpers/icon.mjs";
import { omit } from "../../../helpers/utils.mjs";
import { BaseDocumentSheetMixin } from "../../api/_module.mjs";
import { TeriockDragDrop } from "../../ux/_module.mjs";
import {
  DocumentCreationSheetMixin,
  DragDropSheetMixin,
  FieldsSheetMixin,
  LockingSheetMixin,
  MechanicsSheetMixin,
  PreviewSheetMixin,
  SystemSettingsButtonSheetMixin,
} from "../mixins/_module.mjs";

const { ActiveEffectConfig } = foundry.applications.sheets;

/**
 * @import { ApplicationConfiguration, ApplicationTabsConfiguration } from "@client/applications/_types.mjs";
 * @import { HandlebarsTemplatePart } from "@client/applications/api/handlebars-application.mjs";
 */

/**
 * Imbuement and consequence sheet.
 * @mixes BaseDocumentSheet
 * @mixes SystemSettingsButtonSheet
 * @mixes DocumentCreationSheet
 * @mixes DragDropSheet
 * @mixes FieldsSheet
 * @mixes LockingSheet
 * @mixes MechanicsSheet
 * @mixes PreviewSheet
 * @property {TeriockActiveEffect<"consequence">} document
 */
export default class ApplicableEffectSheet
  extends mixClasses(
    ActiveEffectConfig,
    BaseDocumentSheetMixin,
    SystemSettingsButtonSheetMixin,
    DocumentCreationSheetMixin,
    DragDropSheetMixin,
    FieldsSheetMixin,
    LockingSheetMixin,
    MechanicsSheetMixin,
    PreviewSheetMixin,
  )
{
  /** @type {Partial<ApplicationConfiguration & Teriock.Sheet._SheetConfiguration>} */
  static DEFAULT_OPTIONS = {
    form: { closeOnSubmit: false, submitOnChange: true },
    teriock: { startLocked: false },
    window: { resizable: true },
  };

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
    ...super.TABS,
    sheet: {
      initial: super.TABS.sheet.initial,
      labelPrefix: super.TABS.sheet.labelPrefix,
      tabs: [...super.TABS.sheet.tabs, { icon: makeIconClass(icons.manifest.ui.document, "solid"), id: "children" }, {
        icon: makeIconClass(icons.manifest.pseudoDocument.mechanic, "solid"),
        id: "mechanics",
      }],
    },
  };

  #editorForms;

  /** @type {string|null} */
  #tabBeforeDrag = null;

  /** @inheritDoc */
  async _onDragLeaveApplication() {
    await super._onDragLeaveApplication();
    if (this.#tabBeforeDrag) { this._safeChangeTab(this.#tabBeforeDrag, "sheet"); }
    this.#tabBeforeDrag = null;
  }

  /** @inheritDoc */
  async _onDragOver(event) {
    await super._onDragOver(event);
    if (event.dataTransfer.dropEffect === "none" || this._fieldDropTarget(event)) { return; }
    if (this.tabGroups.sheet === "mechanics" || !this._mechanicCollectionFor(TeriockDragDrop.payload?.type)) { return; }
    this.#tabBeforeDrag ??= this.tabGroups.sheet;
    this._safeChangeTab("mechanics", "sheet");
  }

  /** @inheritDoc */
  async _onDrop(event) {
    this.#tabBeforeDrag = null;
    await super._onDrop(event);
  }

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

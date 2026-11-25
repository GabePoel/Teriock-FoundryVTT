import { createElement, makeIconClass, mixClasses, omit } from "../../../utils/_module.mjs";
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
 * @import * as hookEvents from "@client/hooks.mjs";
 */

/**
 * Imbuement and consequence sheet.
 * @extends {ActiveEffectConfig}
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

  /** @type {Record<string, HandlebarsTemplatePart & Teriock.Sheet._TemplatePart>} */
  static PARTS = {
    ...omit(super.PARTS, ["footer"]),
    header: { template: "teriock/sheets/shared/top" },
    children: {
      scrollable: [""],
      template: "teriock/sheets/effects/consequence/children-tab",
      teriock: { previews: ["children"] },
    },
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
      tabs: [...super.TABS.sheet.tabs, {
        icon: makeIconClass(TERIOCK.DISPLAY.icons.manifest.ui.document, "solid"),
        id: "children",
      }, { icon: makeIconClass(TERIOCK.DISPLAY.icons.manifest.pseudoDocument.mechanic, "solid"), id: "mechanics" }],
    },
  };

  #editorForms;

  /** @inheritDoc */
  _onConfigurePlugins(event) {
    const { keyMaps, menu } = event.plugins;
    super._onConfigurePlugins(event);
    Object.assign(event.plugins, { keyMaps, menu });
  }

  /** @inheritDoc */
  async _onDragOver(event) {
    await super._onDragOver(event);
    if (event.dataTransfer.dropEffect === "none" || this._fieldDropTarget(event)) { return; }
    if (!this._mechanicCollectionFor(TeriockDragDrop.payload?.type)) { return; }
    this._revealDragTab("mechanics", "sheet");
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
    if (this.#editorForms) { result.details?.append(this.#editorForms); }
    super._replaceHTML(result, content, options);
    for (const [part, tips] of Object.entries(this.getTips())) {
      if (result[part] && tips.length) {
        const container = createElement("ul", { className: "notification-container" });
        for (const tip of tips) {
          const li = createElement("li", { className: `notification ${tip.level ?? "info"}` });
          li.append(createElement("span", { innerText: _loc(tip.message) }));
          container.append(li);
        }
        result[part].prepend(container);
      }
    }
  }

  /**
   * Tips that will appear on certain tabs.
   * @returns {object[]}
   */
  getTips() {
    const out = {
      changes: [{ message: "TERIOCK.SHEETS.ApplicableEffect.TIPS.changes" }],
      duration: [{ message: "TERIOCK.SHEETS.ApplicableEffect.TIPS.duration" }],
    };
    if (
      !this.document.actor
      && new Set(this.document.system.metadata.childTypes).intersection(new Set(Item.implementation.TYPES)).size
    ) {
      out.children = [{ level: "warning", message: "TERIOCK.SHEETS.ApplicableEffect.TIPS.noItems" }];
    }
    return out;
  }
}

/**
 * Re-render sheets to show updated durations.
 * @see {@link hookEvents.updateWorldTime}
 */
async function refreshEffectDurations() {
  for (const app of ApplicableEffectSheet.instances()) {
    if (app.document.isTemporary) { app.render({ parts: ["duration"] }); }
  }
}
Hooks.on("updateWorldTime", refreshEffectDurations);

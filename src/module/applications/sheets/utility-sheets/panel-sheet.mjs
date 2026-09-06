import { icons } from "../../../constants/display/_module.mjs";
import { mixClasses } from "../../../helpers/construction.mjs";
import { makeIconClass } from "../../../helpers/icon.mjs";
import { DragDropApplicationMixin, TeriockDocumentSheet } from "../../api/_module.mjs";
import { TeriockTextEditor } from "../../ux/_module.mjs";

/**
 * @import { ApplicationConfiguration } from "@client/applications/_types.mjs";
 * @import { HandlebarsTemplatePart } from "@client/applications/api/handlebars-application.mjs";
 */

/**
 * A simple sheet for displaying a document as a simple panel.
 * @mixes DragDropApplication
 */
export default class PanelSheet extends mixClasses(TeriockDocumentSheet, DragDropApplicationMixin) {
  /**
   * Open this document's main sheet.
   * @returns {Promise<void>}
   */
  static async #onOpenSheet() {
    await this.document.sheet.render(true);
  }

  /** @type {Partial<ApplicationConfiguration & Teriock.Sheet._SheetConfiguration>} */
  static DEFAULT_OPTIONS = {
    actions: { openSheet: this.#onOpenSheet },
    classes: ["panel-application"],
    position: { width: 300 },
    teriock: { autoIcon: false, dragDrop: { style: { minimizeOnDragStart: true } } },
    window: {
      controls: [{
        action: "openSheet",
        icon: makeIconClass(icons.manifest.ui.sheet),
        label: "TERIOCK.SHEETS.Panel.OPEN_SHEET",
        ownership: "VIEWER",
      }],
      icon: makeIconClass(icons.manifest.ui.panel, "title"),
      resizable: false,
    },
  };

  /** @type {Record<string, HandlebarsTemplatePart>} */
  static PARTS = { panel: { scrollable: [""], template: "teriock/ui/panel" } };

  /** @inheritDoc */
  get isEditable() {
    return true;
  }

  /** @inheritDoc */
  async _onRender(context, options) {
    await super._onRender(context, options);
    this.element.querySelectorAll(".teriock-panel-header[data-action='toggleCollapse']").forEach(el =>
      delete el.dataset.action
    );
  }

  /** @inheritDoc */
  async _prepareContext(options) {
    return Object.assign(
      await super._prepareContext(options),
      await TeriockTextEditor.enrichPanel(await this.document.getPanelParts(), {
        relativeTo: this.document,
        secrets: this.document.isOwner,
      }),
    );
  }
}

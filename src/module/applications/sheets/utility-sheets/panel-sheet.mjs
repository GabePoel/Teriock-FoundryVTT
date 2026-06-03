import { icons } from "../../../constants/display/icons.mjs";
import { makeIconClass } from "../../../helpers/utils.mjs";
import { TeriockDocumentSheet } from "./_module.mjs";

export default class TeriockPanelSheet extends TeriockDocumentSheet {
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
    teriock: { autoIcon: false },
    window: {
      controls: [{
        action: "openSheet",
        icon: makeIconClass(icons.ui.sheet),
        label: "TERIOCK.SHEETS.Panel.OPEN_SHEET",
        ownership: "VIEWER",
      }],
      icon: makeIconClass(icons.ui.panel, "title"),
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
  async _prepareContext(options) {
    return Object.assign(await super._prepareContext(options), await this.document.toPanel());
  }
}

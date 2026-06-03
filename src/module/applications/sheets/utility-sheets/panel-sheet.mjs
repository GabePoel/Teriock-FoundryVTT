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

  /** @inheritDoc */
  static DEFAULT_OPTIONS = {
    actions: { openSheet: this.#onOpenSheet },
    classes: ["panel-application"],
    position: { width: 300 },
    window: {
      controls: [{
        action: "openSheet",
        icon: makeIconClass(icons.ui.sheet),
        label: "TERIOCK.SHEETS.Panel.OPEN_SHEET",
        ownership: "VIEWER",
      }],
      resizable: false,
    },
  };

  /** @inheritDoc */
  static PARTS = { panel: { scrollable: [""], template: "teriock/ui/panel" } };

  /** @inheritDoc */
  get isEditable() {
    return true;
  }

  /** @inheritDoc */
  async _onFirstRender(context, options) {
    const out = await super._onFirstRender(context, options);
    const icon = CONFIG[this.document.documentName]?.typeIcons[this.document.type]
      ?? CONFIG[this.document.documentName].sidebarIcon ?? TERIOCK.config.document.document.icon;
    this.window.icon.className = makeIconClass(icon, "title");
    return out;
  }

  /** @inheritDoc */
  async _prepareContext(options) {
    return Object.assign(await super._prepareContext(options), await this.document.toPanel());
  }
}

import { makeIcon } from "../../../helpers/utils.mjs";
import { ChildSheet } from "../utility-sheets/_module.mjs";

/**
 * {@link TeriockFluency} sheet.
 * @extends {ChildSheet}
 * @property {TeriockFluency} document
 */
export default class FluencySheet extends ChildSheet {
  /** @type {string[]} */
  static BARS = ["teriock/sheets/effects/fluency/tradecraft-bar"];

  /**
   * Context menu for selecting a field.
   * @returns {ContextMenuEntry[]}
   */
  #fieldContextMenuEntries() {
    const options = [];
    for (const [fKey, fData] of Object.entries(TERIOCK.config.tradecraft.fields)) {
      const firstTradecraft = Object.keys(TERIOCK.config.tradecraft.tradecrafts).find(tcKey =>
        TERIOCK.config.tradecraft.tradecrafts[tcKey].field === fKey
      );
      const option = {
        icon: makeIcon(fData.icon, "contextMenu"),
        label: fData.label,
        onClick: async () => {
          const updateData = { system: { field: fKey, tradecraft: firstTradecraft } };
          await this.document.update(updateData);
        },
      };
      options.push(option);
    }
    return options;
  }

  /**
   * Context menu entries for selecting a tradecraft.
   * @returns {ContextMenuEntry[]}
   */
  #tradecraftContextMenuEntries() {
    const options = [];
    for (const [tcKey, tcData] of Object.entries(TERIOCK.config.tradecraft.tradecrafts)) {
      const fKey = tcData.field;
      const option = {
        icon: makeIcon(tcData.icon, "contextMenu"),
        label: tcData.label,
        onClick: async () => {
          const updateData = { system: { field: fKey, tradecraft: tcKey } };
          await this.document.update(updateData);
        },
        visible: () => this.document.system._source.field === fKey,
      };
      options.push(option);
    }
    return options;
  }

  /** @inheritDoc */
  async _onRender(context, options) {
    await super._onRender(context, options);
    this._connectContextMenu(".field-box", this.#fieldContextMenuEntries(), "click");
    this._connectContextMenu(".tradecraft-box", this.#tradecraftContextMenuEntries(), "click");
  }
}

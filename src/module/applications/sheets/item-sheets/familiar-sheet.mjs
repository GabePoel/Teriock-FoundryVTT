import SimpleItemSheet from "./simple-item-sheet.mjs";

/**
 * Familiar sheet.
 * @property {TeriockItem<"familiar">} document
 */
export default class FamiliarSheet extends SimpleItemSheet {
  /** @type {string[]} */
  static BARS = [
    "teriock/sheets/items/power/status-bar",
    "teriock/sheets/items/familiar/familiar-bar",
    "teriock/sheets/shared/bars/stat-bar",
  ];

  /** @inheritDoc */
  async _prepareContext(options) {
    const { actorUuid } = this.document.system;
    return Object.assign(await super._prepareContext(options), {
      familiarName: (actorUuid && (await fromUuid(actorUuid))?.name) || _loc("TERIOCK.COMMON.None"),
    });
  }
}

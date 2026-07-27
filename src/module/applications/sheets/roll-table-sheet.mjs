const { RollTableSheet } = foundry.applications.sheets;

/** @inheritDoc */
export default class TeriockRollTableSheet extends RollTableSheet {
  /** @inheritDoc */
  async _createResult(initialData = {}) {
    if (initialData.documentUuid) {
      const doc = await fromUuid(initialData.documentUuid);
      if (doc?.typedIdentifier) {
        foundry.utils.setProperty(initialData, "flags.teriock.documentIdentifier", doc.typedIdentifier);
        if (game.settings.get("teriock", "dontDropUuidsInTables")) { delete initialData.documentUuid; }
      }
    }
    return super._createResult(initialData);
  }
}

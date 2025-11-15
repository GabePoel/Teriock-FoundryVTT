const { RollTable } = foundry.documents;

/**
 * The Teriock {@link RollTable} implementation.
 * @extends {RollTable}
 * @extends {ClientDocument}
 * @property {EmbeddedCollection<Teriock.ID<TeriockTableResult>, TeriockTableResult>} results
 */
export default class TeriockRollTable extends RollTable {
  /** @inheritDoc */
  static async fromFolder(folder, options = {}) {
    const table = await super.fromFolder(folder, options);
    if (game.settings.get("teriock", "developerMode") && game.user.isGM) {
      await table.update({
        description: "",
      });
    }
    return table;
  }
}

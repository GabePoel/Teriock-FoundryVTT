import { BaseDocumentMixin } from "../mixins/_module.mjs";

const { RollTable } = foundry.documents;

/**
 * The Teriock {@link RollTable} implementation.
 * @extends {RollTable}
 * @extends {ClientDocument}
 * @mixes BaseDocument
 * @property {EmbeddedCollection<Teriock.ID<TeriockTableResult>, TeriockTableResult>} results
 */
export default class TeriockRollTable extends BaseDocumentMixin(RollTable) {
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

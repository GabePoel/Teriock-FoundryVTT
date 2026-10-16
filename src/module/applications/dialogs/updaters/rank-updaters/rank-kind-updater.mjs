import KindUpdater from "../kind-updater.mjs";

/**
 * Dialog for updating where a rank came from.
 * @property {TeriockItem<"rank">} document
 */
export default class RankKindUpdater extends KindUpdater {
  /** @inheritDoc */
  async _preparePartContext(partId, context, options) {
    context = await super._preparePartContext(partId, context, options);
    if (partId === "form" && this.document.sup?.type === "species") {
      for (const field of context.fields) {
        if (field.name === "system.kind") {
          // Ranks from a species are always innate.
          field.disabled = true;
          field.hint = _loc("TERIOCK.SYSTEMS.Rank.DIALOG.speciesInnate");
          field.value = this.document.system.kind;
        }
      }
    }
    return context;
  }
}

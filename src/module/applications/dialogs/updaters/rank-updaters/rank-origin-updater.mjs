import { icons } from "../../../../constants/display/icons.mjs";
import { makeIconClass } from "../../../../helpers/icon.mjs";
import BaseUpdater from "../base-updater.mjs";

/**
 * Dialog for updating where a rank came from.
 * @property {TeriockRank} document
 */
export default class RankOriginUpdater extends BaseUpdater {
  /** @type {Partial<ApplicationConfiguration & Teriock.Sheet._SheetConfiguration>} */
  static DEFAULT_OPTIONS = { window: { icon: makeIconClass(icons.power.innate, "title") } };

  /** @inheritDoc */
  get _dataPaths() {
    return ["system.origin"];
  }

  /** @inheritDoc */
  async _preparePartContext(partId, context, options) {
    context = await super._preparePartContext(partId, context, options);
    if (partId === "form" && this.document.sup?.type === "species") {
      for (const field of context.fields) {
        if (field.name === "system.origin") {
          // A species forces its ranks innate, so show that rather than the overridden source value.
          field.disabled = true;
          field.hint = _loc("TERIOCK.SYSTEMS.Rank.DIALOG.speciesInnate");
          field.value = this.document.system.origin;
        }
      }
    }
    return context;
  }
}

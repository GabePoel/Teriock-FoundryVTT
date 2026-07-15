import { icons } from "../../../../constants/display/icons.mjs";
import { makeIconClass } from "../../../../helpers/icon.mjs";
import BaseUpdater from "../base-updater.mjs";

/**
 * Dialog for updating whether a rank is innate.
 * @property {TeriockRank} document
 */
export default class RankInnateUpdater extends BaseUpdater {
  /** @type {Partial<ApplicationConfiguration & Teriock.Sheet._SheetConfiguration>} */
  static DEFAULT_OPTIONS = { window: { icon: makeIconClass(icons.power.innate, "title") } };

  /** @inheritDoc */
  get _dataPaths() {
    return ["system.innate"];
  }

  /** @inheritDoc */
  async _preparePartContext(partId, context, options) {
    context = await super._preparePartContext(partId, context, options);
    if (partId === "form" && this.document.sup?.type === "species") {
      for (const field of context.fields) {
        if (field.name === "system.innate") {
          // A species forces its ranks innate, so show that rather than the overridden source value.
          field.disabled = true;
          field.hint = _loc("TERIOCK.SYSTEMS.Rank.DIALOG.speciesInnate");
          field.value = this.document.system.innate;
        }
      }
    }
    return context;
  }
}

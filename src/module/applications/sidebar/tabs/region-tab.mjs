import { makeIconClass } from "../../../helpers/icon.mjs";

const { RegionTab } = foundry.applications.sidebar.tabs;

/**
 * @import { ApplicationConfiguration } from "@client/applications/_types.mjs";
 */

/** @inheritDoc */
export default class TeriockRegionTab extends RegionTab {
  static async #onClearTargets() {
    if (!game.teriock.checkScene()) { return; }
    await canvas.scene.deleteEmbeddedDocuments(
      "Region",
      canvas.scene.regions.filter(t => t.isOwner && t.getFlag("teriock", "targetRegion")).map(t => t.id),
    );
  }

  /** @type {Partial<ApplicationConfiguration>} */
  static DEFAULT_OPTIONS = { actions: { clearTargets: this.#onClearTargets } };

  /** @inheritDoc */
  async _prepareSearchContext(context, options) {
    context = await super._prepareSearchContext(context, options);
    if (game.settings.get("teriock", "preserveTargetRegions")) {
      context.filters.push({
        action: "clearTargets",
        active: false,
        cssClass: `${makeIconClass(TERIOCK.display.icons.manifest.ui.clearTargets)} tcenter`,
        tooltip: "TERIOCK.DIALOGS.ClearTargets.title",
      });
    }
    return context;
  }
}

import TeriockDialog from "../../applications/api/dialog.mjs";
import { makeIconClass } from "../../utils/icon.mjs";

const { RegionLayer: Regions } = foundry.canvas.layers;

/**
 * Delete all the targets you control.
 */
async function deleteTargets() {
  TeriockDialog.confirm({
    content: `<p>${_loc("TERIOCK.DIALOGS.ClearTargets.hint")}</p>`,
    window: {
      icon: makeIconClass(TERIOCK.DISPLAY.icons.manifest.ui.clearTargets, "title"),
      title: "TERIOCK.DIALOGS.ClearTargets.title",
    },
    yes: {
      callback: async () => {
        const deleted = await canvas.scene.deleteEmbeddedDocuments(
          "Region",
          canvas.scene.regions.filter(t =>
            (t.isOwner || (t.getFlag("teriock", "placedBy") === game.user.id)) && t.getFlag("teriock", "targetRegion")
          ).map(t => t.id),
          { asGM: true },
        );
        ui.notifications.info("CONTROLS.DeletedObjects", {
          format: { count: deleted.length, type: _loc(RegionDocument.implementation.metadata.label) },
        });
      },
    },
  });
}

/** @inheritDoc */
export default class TeriockRegionLayer extends Regions {
  /** @inheritDoc */
  static prepareSceneControls() {
    const controls = super.prepareSceneControls();
    return Object.assign(controls, {
      tools: Object.assign(controls.tools, {
        clearTargets: {
          button: true,
          icon: makeIconClass(TERIOCK.DISPLAY.icons.manifest.ui.clearTargets, "button"),
          name: "clearTargets",
          onChange: deleteTargets,
          order: controls.tools.clear.order,
          title: "TERIOCK.DIALOGS.ClearTargets.title",
        },

        clear: Object.assign(controls.tools.clear, { order: controls.tools.clear.order + 1 }),
      }),
    });
  }
}

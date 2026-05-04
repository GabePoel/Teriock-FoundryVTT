import { icons } from "../../../constants/display/icons.mjs";
import { BaseActivation } from "./abstract/_module.mjs";

const { fields } = foundry.data;

export default class RegionActivation extends BaseActivation {
  /** @inheritDoc */
  static get ICON() {
    return icons.document.region;
  }

  /** @inheritDoc */
  static get LABEL() {
    return "TERIOCK.ACTIVATIONS.Region.BUTTON";
  }

  /** @inheritDoc */
  static get TYPE() {
    return "region";
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      data: new fields.ObjectField(),
      attachToToken: new fields.BooleanField(),
    });
  }

  /**
   * @inheritDoc
   * @returns {Promise<TeriockRegionDocument>}
   */
  async primaryAction() {
    const data = this.data;
    foundry.utils.setProperty(data, "flags.teriock.createdBy", this.puuid);
    const toMinimize = Array.from(
      foundry.applications.instances.values(),
    ).filter((a) => a.hasFrame && !a.minimized);
    await Promise.all((toMinimize || []).map((s) => s?.minimize()));
    const region = await canvas.regions.placeRegion(data, {
      allowRotation: true,
      attachToToken: this.attachToToken,
      createOptions: { asGM: true },
    });
    await Promise.all((toMinimize || []).map((s) => s?.maximize()));
    return region;
  }

  /** @inheritDoc */
  async secondaryAction() {
    await canvas.scene.deleteEmbeddedDocuments(
      "Region",
      canvas.scene.regions.contents
        .filter((r) => r.getFlag("teriock", "createdBy") === this.puuid)
        .map((r) => r.id),
    );
  }
}

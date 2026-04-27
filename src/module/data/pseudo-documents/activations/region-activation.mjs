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

  /** @inheritDoc */
  async primaryAction() {
    const data = this.data;
    foundry.utils.setProperty(data, "flags.teriock.createdBy", this.puuid);
    console.log(data);
    await canvas.regions.placeRegion(data, {
      allowRotation: true,
      attachToToken: this.attachToToken,
    });
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

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
    await canvas.regions.placeRegion(this.data, {
      allowRotation: true,
      attachToToken: this.attachToToken,
    });
  }
}

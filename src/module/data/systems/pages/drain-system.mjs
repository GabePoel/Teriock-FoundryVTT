import { mergeMetadata } from "../../../utils/_module.mjs";
import { HarmPageSystem } from "./abstract/_module.mjs";

export default class DrainSystem extends HarmPageSystem {
  /** @inheritDoc */
  static metadata = mergeMetadata(super.metadata, {
    icon: TERIOCK.DISPLAY.icons.manifest.effect.drain,
    img: TERIOCK.DISPLAY.thumbnails.manifest.document.drain,
    type: "drain",
  });

  /** @inheritDoc */
  async _preCreate(data, options, user) {
    const yes = await super._preCreate(data, options, user);
    if (yes === false) { return false; }

    this.parent.updateSource(foundry.utils.mergeObject({ system: { effectTypes: ["draining"] } }, data));
  }
}

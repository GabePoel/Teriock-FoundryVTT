import { icons, thumbnails } from "../../../static/display/_module.mjs";
import { mergeMetadata } from "../../../utils/_module.mjs";
import HarmSystem from "./harm-system.mjs";

export default class DamageSystem extends HarmSystem {
  /** @inheritDoc */
  static metadata = mergeMetadata(super.metadata, {
    icon: icons.manifest.effect.damage,
    img: thumbnails.manifest.document.damage,
    type: "damage",
  });

  /** @inheritDoc */
  async _preCreate(data, options, user) {
    const yes = await super._preCreate(data, options, user);
    if (yes === false) { return false; }

    this.parent.updateSource(foundry.utils.mergeObject({ system: { effectTypes: ["damaging"] } }, data));
  }
}

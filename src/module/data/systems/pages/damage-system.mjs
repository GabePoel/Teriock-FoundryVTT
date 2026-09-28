import { icons } from "../../../constants/display/_module.mjs";
import { mergeMetadata } from "../../../helpers/construction.mjs";
import HarmSystem from "./harm-system.mjs";

export default class DamageSystem extends HarmSystem {
  /** @inheritDoc */
  static metadata = mergeMetadata(super.metadata, { icon: icons.manifest.effect.damage, type: "damage" });

  /** @inheritDoc */
  async _preCreate(data, options, user) {
    const yes = await super._preCreate(data, options, user);
    if (yes === false) { return false; }

    this.parent.updateSource(foundry.utils.mergeObject({ system: { effectTypes: ["damaging"] } }, data));
  }
}

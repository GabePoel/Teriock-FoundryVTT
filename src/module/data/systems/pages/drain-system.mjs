import { mergeMetadata } from "../../../helpers/construction.mjs";
import HarmSystem from "./harm-system.mjs";

export default class DrainSystem extends HarmSystem {
  /** @inheritDoc */
  static metadata = mergeMetadata(super.metadata, { type: "drain" });

  /** @inheritDoc */
  async _preCreate(data, options, user) {
    const yes = await super._preCreate(data, options, user);
    if (yes === false) { return false; }

    this.parent.updateSource(foundry.utils.mergeObject({ system: { effectTypes: ["draining"] } }, data));
  }
}

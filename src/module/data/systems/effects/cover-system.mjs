import { icons } from "../../../static/display/_module.mjs";
import { mergeMetadata } from "../../../utils/_module.mjs";
import BaseEffectSystem from "./base-effect-system/base-effect-system.mjs";

export default class CoverSystem extends BaseEffectSystem {
  /** @inheritDoc */
  static metadata = mergeMetadata(super.metadata, { icon: icons.manifest.cover.full, type: "cover" });
}

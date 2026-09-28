import { icons } from "../../../constants/display/_module.mjs";
import { mergeMetadata } from "../../../helpers/construction.mjs";
import BaseEffectSystem from "./base-effect-system/base-effect-system.mjs";

export default class CoverSystem extends BaseEffectSystem {
  /** @inheritDoc */
  static metadata = mergeMetadata(super.metadata, { icon: icons.manifest.cover.full, type: "cover" });
}

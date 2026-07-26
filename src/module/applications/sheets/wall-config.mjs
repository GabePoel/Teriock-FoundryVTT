import { EtherealConfigMixin } from "./mixins/_module.mjs";

const { WallConfig } = foundry.applications.sheets;

/** @inheritDoc */
export default class TeriockWallConfig extends EtherealConfigMixin(WallConfig) {
  /** @inheritDoc */
  get etherealInsertAfter() {
    return "animation.type";
  }
}

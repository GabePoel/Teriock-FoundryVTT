import BaseEffectSystem from "./base-effect-system/base-effect-system.mjs";

/**
 * A class that enforces data cleaning for the various active effect types that have more custom behavior than
 * effects in Foundry normally do.
 */
export default class CleanedEffectSystem extends BaseEffectSystem {
  /** @inheritDoc */
  prepareBaseData() {
    this.changes = [];
    this.parent.transfer = true;
    this.parent.statuses.clear();
    super.prepareBaseData();
  }
}

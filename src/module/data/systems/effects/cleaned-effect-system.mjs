import * as systemMixins from "../mixins/_module.mjs";
import BaseEffectSystem from "./base-effect-system/base-effect-system.mjs";

/**
 * A class that enforces data cleaning for the various active effect types that have more custom behavior than
 * effects in Foundry normally do.
 * @mixes InstructionsSystem
 */
export default class CleanedEffectSystem extends systemMixins.InstructionsSystemMixin(BaseEffectSystem) {
  /** @inheritDoc */
  static get metadata() {
    return Object.assign(super.metadata, { untrackable: true });
  }

  /** @inheritDoc */
  async _preCreate(data, options, user) {
    const yes = await super._preCreate(data, options, user);
    if (yes === false) { return false; }

    this.parent.updateSource({
      duration: { expired: false, expiry: null, value: null },
      showIcon: CONST.ACTIVE_EFFECT_SHOW_ICON.NEVER,
      statuses: [],
      transfer: true,
    });
  }

  /** @inheritDoc */
  async _preUpdate(changes, options, user) {
    const yes = await super._preUpdate(changes, options, user);
    if (yes === false) { return false; }

    if (changes?.transfer === false) { return false; }
  }

  /** @inheritDoc */
  prepareBaseData() {
    this.changes = [];
    this.parent.duration.expired = false;
    this.parent.duration.expiry = null;
    this.parent.duration.value = Infinity;
    this.parent.statuses.clear();
    this.parent.transfer = true;
    super.prepareBaseData();
  }
}

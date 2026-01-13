import { mix } from "../../../../helpers/utils.mjs";
import * as mixins from "../../mixins/_module.mjs";
import BaseEffectSystem from "../base-effect-system/base-effect-model.mjs";

//noinspection JSClosureCompilerSyntax
/**
 * Resource-specific effect data model.
 * @extends {BaseEffectSystem}
 * @implements {Teriock.Models.ResourceSystemInterface}
 * @mixes ConsumableSystem
 * @mixes ExecutableSystem
 * @mixes RevelationSystem
 */
export default class ResourceSystem extends mix(
  BaseEffectSystem,
  mixins.ExecutableSystemMixin,
  mixins.ConsumableSystemMixin,
  mixins.RevelationSystemMixin,
) {
  /** @inheritDoc */
  static get metadata() {
    return foundry.utils.mergeObject(super.metadata, {
      type: "resource",
      usable: true,
    });
  }

  /** @inheritDoc */
  get makeSuppressed() {
    let suppressed = super.makeSuppressed;
    if (!suppressed && this.parent.parent.type === "equipment") {
      suppressed = !this.parent.parent.system.isAttuned;
    }
    return suppressed;
  }

  /** @inheritDoc */
  get nameString() {
    const nameAddition = this.revealed ? "" : " (Unrevealed)";
    return this.parent.name + nameAddition;
  }

  /** @inheritDoc */
  get panelParts() {
    const parts = super.panelParts;
    parts.bars.push({
      icon: "fa-hashtag",
      label: "Quantity",
      wrappers: [
        `${this.quantity} Remaining`,
        `${this.maxQuantity.value === Infinity ? "No" : this.maxQuantity.value} Maximum`,
      ],
    });
    return parts;
  }

  /** @inheritDoc */
  async gainOne() {
    await super.gainOne();
    await this.parent.enable();
  }

  /** @inheritDoc */
  async useOne() {
    const toDisable = this.quantity <= 1;
    await super.useOne();
    if (toDisable) {
      await this.parent.disable();
    }
  }
}

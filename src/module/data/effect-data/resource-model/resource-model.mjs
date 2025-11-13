import { mergeMetadata } from "../../../helpers/utils.mjs";
import {
  ConsumableDataMixin,
  ExecutableDataMixin,
  RevelationDataMixin,
} from "../../mixins/_module.mjs";
import TeriockBaseEffectModel from "../base-effect-model/base-effect-model.mjs";
import { _messageParts } from "./methods/_messages.mjs";
import { _migrateData } from "./methods/_migrate-data.mjs";

/**
 * Resource-specific effect data model.
 * @extends {TeriockBaseEffectModel}
 * @mixes ConsumableData
 * @mixes ExecutableData
 * @mixes RevelationData
 */
export default class TeriockResourceModel extends RevelationDataMixin(
  ConsumableDataMixin(ExecutableDataMixin(TeriockBaseEffectModel)),
) {
  /** @inheritDoc */
  static metadata = mergeMetadata(super.metadata, {
    type: "resource",
    usable: true,
  });

  /** @inheritDoc */
  static migrateData(data) {
    data = _migrateData(data);
    return super.migrateData(data);
  }

  /** @inheritDoc */
  get messageParts() {
    return { ...super.messageParts, ..._messageParts(this) };
  }

  /** @inheritDoc */
  get nameString() {
    const nameAddition = this.revealed ? "" : " (Unrevealed)";
    return this.parent.name + nameAddition;
  }

  /** @inheritDoc */
  get suppressed() {
    let suppressed = super.suppressed;
    if (!suppressed && this.parent.parent.type === "equipment") {
      suppressed = !this.parent.parent.system.isAttuned;
    }
    return suppressed;
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

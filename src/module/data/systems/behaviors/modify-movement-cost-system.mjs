import { mergeMetadata } from "../../../utils/_module.mjs";
import { WrappedBehaviorSystemMixin } from "../mixins/_module.mjs";

const { ModifyMovementCostRegionBehaviorType } = foundry.data.regionBehaviors;

/**
 * @inheritDoc
 * @extends {ModifyMovementCostRegionBehaviorType}
 * @mixes WrappedBehaviorSystem
 */
export default class ModifyMovementCostSystem extends WrappedBehaviorSystemMixin(ModifyMovementCostRegionBehaviorType) {
  /** @inheritDoc */
  static metadata = mergeMetadata(super.metadata, { type: "modifyMovementCost" });
}

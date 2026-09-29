import { mergeMetadata, mixClasses } from "../../../helpers/construction.mjs";
import { BaseSystemMixin, UncommonSystemMixin } from "../mixins/_module.mjs";

const { TypeDataModel } = foundry.abstract;

/**
 * @extends {TypeDataModel}
 * @mixes BaseSystem
 * @mixes UncommonSystem
 */
export default class BaseCardSystem extends mixClasses(TypeDataModel, BaseSystemMixin, UncommonSystemMixin) {
  /** @inheritDoc */
  static metadata = mergeMetadata(super.metadata, { documentName: "Card", type: "base" });
}

import { mixClasses } from "../../../helpers/construction.mjs";
import { BaseSystemMixin, UncommonSystemMixin } from "../mixins/_module.mjs";

const { TypeDataModel } = foundry.abstract;

/**
 * @mixes BaseSystem
 * @mixes UncommonSystem
 */
export default class BaseCardsSystem extends mixClasses(TypeDataModel, BaseSystemMixin, UncommonSystemMixin) {}

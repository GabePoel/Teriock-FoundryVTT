import * as systemMixins from "../mixins/_module.mjs";

const { TypeDataModel } = foundry.abstract;

export default class BaseCardsSystem extends systemMixins.BaseSystemMixin(TypeDataModel) {}

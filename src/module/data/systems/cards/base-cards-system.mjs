import { BaseSystemMixin } from "../mixins/_module.mjs";

const { TypeDataModel } = foundry.abstract;

export default class BaseCardsSystem extends BaseSystemMixin(TypeDataModel) {}

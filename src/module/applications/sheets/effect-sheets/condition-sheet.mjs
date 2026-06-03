import { BaseSheetMixin } from "../mixins/_module.mjs";

const { ActiveEffectConfig } = foundry.applications.sheets;

/**
 * {@link TeriockCondition} sheet.
 * @property {TeriockCondition} document
 */
export default class ConditionSheet extends BaseSheetMixin(ActiveEffectConfig) {}

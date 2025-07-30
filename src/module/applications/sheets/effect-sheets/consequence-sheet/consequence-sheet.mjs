const { api } = foundry.applications;
import TeriockBaseEffectSheet from "../base-effect-sheet/base-effect-sheet.mjs";

/**
 * Effect sheet for Teriock system effects.
 * Provides basic effect management functionality extending the base effect sheet.
 * @extends {TeriockBaseEffectSheet}
 */
export default class TeriockConsequenceSheet extends api.HandlebarsApplicationMixin(
  TeriockBaseEffectSheet,
) {}

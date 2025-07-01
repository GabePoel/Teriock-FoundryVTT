const { api } = foundry.applications;
import TeriockBaseEffectSheet from "../base-sheet/base-sheet.mjs";

/**
 * Effect sheet for Teriock system effects.
 * Provides basic effect management functionality extending the base effect sheet.
 * @extends {TeriockBaseEffectSheet}
 */
export default class TeriockEffectSheet extends api.HandlebarsApplicationMixin(TeriockBaseEffectSheet) {}

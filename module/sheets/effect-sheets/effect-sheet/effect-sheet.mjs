const { api } = foundry.applications;
import TeriockBaseEffectSheet from "../base-sheet/base-sheet.mjs";

/**
 * @extends {TeriockBaseEffectSheet}
 */
export default class TeriockEffectSheet extends api.HandlebarsApplicationMixin(TeriockBaseEffectSheet) {}

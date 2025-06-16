const { api } = foundry.applications;
import { TeriockBaseEffectSheet } from "../base-sheet/base-sheet.mjs";

export class TeriockEffectSheet extends api.HandlebarsApplicationMixin(TeriockBaseEffectSheet) { }
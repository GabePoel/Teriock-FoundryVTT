const { api } = foundry.applications;
import { TeriockEffectSheet } from "../teriock-effect-sheet.mjs";

export class TeriockBaseEffectSheet extends api.HandlebarsApplicationMixin(TeriockEffectSheet) { }
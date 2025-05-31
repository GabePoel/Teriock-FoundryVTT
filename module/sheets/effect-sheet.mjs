const { api, sheets } = foundry.applications;
import { TeriockSheet } from "../mixins/sheet-mixin.mjs";
import { documentOptions } from "../helpers/constants/document-options.mjs";

export class TeriockEffectSheet extends api.HandlebarsApplicationMixin(TeriockSheet(sheets.ActiveEffectConfig)) {
  static DEFAULT_OPTIONS = {
    classes: ['effect'],
    window: {
      icon: `fa-solid fa-${documentOptions.effect.icon}`,
    },
  };
}
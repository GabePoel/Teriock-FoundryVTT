const { api } = foundry.applications;
import { documentOptions } from "../../helpers/constants/document-options.mjs";
import { TeriockEffectSheet } from "../teriock-effect-sheet.mjs";

export class TeriockResourceSheet extends api.HandlebarsApplicationMixin(TeriockEffectSheet) {
  static DEFAULT_OPTIONS = {
    classes: ['resource'],
    window: {
      icon: "fa-solid fa-" + documentOptions.resource.icon,
    },
  };
  static PARTS = {
    all: {
      template: 'systems/teriock/templates/sheets/resource-template/resource-template.hbs',
      scrollable: [
        '.window-content',
        '.tsheet-page',
        '.ab-sheet-everything',
      ],
    },
  };
}
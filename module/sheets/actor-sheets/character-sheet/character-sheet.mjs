const { api } = foundry.applications;
import { documentOptions } from "../../../helpers/constants/document-options.mjs";
import { TeriockBaseActorSheet } from "../base-sheet/base-sheet.mjs";

export class TeriockCharacterSheet extends api.HandlebarsApplicationMixin(TeriockBaseActorSheet) {
  static DEFAULT_OPTIONS = {
    classes: ['character'],
    form: {
      submitOnChange: true,
    },
    position: { width: 800, height: 600 },
    window: {
      icon: `fa-solid fa-${documentOptions.character.icon}`,
    },
  };

  static PARTS = {
    all: {
      template: 'systems/teriock/templates/sheets/character-template/character-template.hbs',
      scrollable: ['.character-sidebar', '.character-tab-content'],
    },
  };
}
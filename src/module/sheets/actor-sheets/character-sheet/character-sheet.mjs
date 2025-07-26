const { api } = foundry.applications;
import { documentOptions } from "../../../helpers/constants/document-options.mjs";
import TeriockBaseActorSheet from "../base-actor-sheet/base-actor-sheet.mjs";

/**
 * Character sheet for Teriock system characters.
 * Extends the base actor sheet with character-specific functionality and Handlebars template support.
 *
 * @extends TeriockBaseActorSheet
 * @property {TeriockCharacter} actor
 * @property {TeriockCharacter} document
 */
export default class TeriockCharacterSheet extends api.HandlebarsApplicationMixin(
  TeriockBaseActorSheet,
) {
  /**
   * Default options for the character sheet.
   * @type {object}
   * @static
   */
  static DEFAULT_OPTIONS = {
    classes: ["character"],
    form: {
      submitOnChange: true,
    },
    position: { width: 800, height: 600 },
    window: {
      icon: `fa-solid fa-${documentOptions.character.icon}`,
    },
  };

  /**
   * Template parts configuration for the character sheet.
   * @type {object}
   * @static
   */
  static PARTS = {
    all: {
      template:
        "systems/teriock/src/templates/actor-templates/character-template/character-template.hbs",
      scrollable: [".character-sidebar", ".character-tab-content"],
    },
  };
}

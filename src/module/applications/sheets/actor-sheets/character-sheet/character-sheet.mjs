import { documentOptions } from "../../../../constants/options/document-options.mjs";
import TeriockBaseActorSheet from "../base-actor-sheet/base-actor-sheet.mjs";

/**
 * Sheet for a {@link TeriockCharacter}.
 */
export default class TeriockCharacterSheet extends TeriockBaseActorSheet {
  /**
   * @inheritDoc
   * @type {Partial<ApplicationConfiguration>}
   */
  static DEFAULT_OPTIONS = {
    classes: ["character"],
    form: {
      submitOnChange: true,
    },
    position: {
      width: 800,
      height: 600,
    },
    window: {
      icon: `fa-solid fa-${documentOptions.character.icon}`,
    },
  };

  /** @inheritDoc */
  static PARTS = {
    all: {
      template:
        "systems/teriock/src/templates/document-templates/actor-templates/character-template/character-template.hbs",
      scrollable: [".character-sidebar", ".character-tab-content"],
    },
  };
}

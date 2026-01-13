import { documentOptions } from "../../../../constants/options/document-options.mjs";
import TeriockPlayableActorSheet from "../base-actor-sheet/playable-actor-sheet.mjs";

/**
 * Sheet for a {@link TeriockCharacter}.
 */
export default class CharacterSheet extends TeriockPlayableActorSheet {
  //noinspection JSValidateTypes
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
        "systems/teriock/src/templates/document-templates/actor-templates/playable-template/playable-template.hbs",
      scrollable: [".character-sidebar", ".character-tab-content"],
    },
  };
}

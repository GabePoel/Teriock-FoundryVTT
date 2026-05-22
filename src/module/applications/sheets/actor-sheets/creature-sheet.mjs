import { documentConfig } from "../../../constants/config/document-config.mjs";
import { makeIconClass } from "../../../helpers/utils.mjs";
import TeriockPlayableActorSheet from "./base-actor-sheet/playable-actor-sheet.mjs";

/**
 * Sheet for a {@link TeriockCharacter}.
 */
export default class CreatureSheet extends TeriockPlayableActorSheet {
  /**
   * @inheritDoc
   * @type {Partial<ApplicationConfiguration>}
   */
  static DEFAULT_OPTIONS = { window: { icon: makeIconClass(documentConfig.creature.icon, "title") } };
}

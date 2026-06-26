import documentConfig from "../../../constants/config/document-config.mjs";
import { makeIconClass } from "../../../helpers/utils.mjs";
import TeriockPlayableActorSheet from "./abstract/playable-actor-sheet.mjs";

/**
 * Sheet for a {@link TeriockCharacter}.
 */
export default class CreatureSheet extends TeriockPlayableActorSheet {
  /** @type {Partial<ApplicationConfiguration & Teriock.Sheet._SheetConfiguration>} */
  static DEFAULT_OPTIONS = { window: { icon: makeIconClass(documentConfig.creature.icon, "title") } };
}

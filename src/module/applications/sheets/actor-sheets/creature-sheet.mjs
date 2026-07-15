import documentConfig from "../../../constants/config/document-config.mjs";
import { makeIconClass } from "../../../helpers/icon.mjs";
import { PlayableActorSheet } from "./abstract/_module.mjs";

/**
 * Sheet for a {@link TeriockCharacter}.
 */
export default class CreatureSheet extends PlayableActorSheet {
  /** @type {Partial<ApplicationConfiguration & Teriock.Sheet._SheetConfiguration>} */
  static DEFAULT_OPTIONS = { window: { icon: makeIconClass(documentConfig.creature.icon, "title") } };
}

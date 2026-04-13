import { documentOptions } from "../../../constants/options/document-options.mjs";
import { makeIconClass } from "../../../helpers/utils.mjs";
import BaseItemSheet from "./base-item-sheet.mjs";

/**
 * Sheet for a {@link TeriockArchetype}.
 * @property {TeriockArchetype} document
 * @property {TeriockArchetype} item
 */
export default class ArchetypeSheet extends BaseItemSheet {
  /** @inheritDoc */
  static DEFAULT_OPTIONS = {
    classes: ["archetype"],
    window: {
      icon: makeIconClass(documentOptions.archetype.icon, "title"),
    },
  };

  /** @inheritDoc */
  static PARTS = {
    ...this.HEADER_PARTS,
    menu: { template: "teriock/sheets/shared/simple-menu" },
    ...this.CONTENT_PARTS,
  };
}

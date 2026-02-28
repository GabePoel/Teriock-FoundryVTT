import { documentOptions } from "../../../constants/options/document-options.mjs";
import { systemPath } from "../../../helpers/path.mjs";
import { makeIconClass } from "../../../helpers/utils.mjs";
import ArmamentSheet from "./armament-sheet.mjs";

/**
 * Sheet for a {@link TeriockBody}.
 * @property {TeriockBody} document
 * @property {TeriockBody} item
 */
export default class BodySheet extends ArmamentSheet {
  /**
   * @inheritDoc
   * @type {Partial<ApplicationConfiguration>}
   */
  static DEFAULT_OPTIONS = {
    classes: ["body"],
    window: {
      icon: makeIconClass(documentOptions.body.icon, "title"),
    },
  };

  /** @inheritDoc */
  static PARTS = {
    ...this.HEADER_PARTS,
    menu: {
      template: systemPath("templates/sheets/items/body/menu.hbs"),
    },
    ...this.CONTENT_PARTS,
  };
}

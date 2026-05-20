import { documentConfig } from "../../../constants/config/document-config.mjs";
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
    window: { icon: makeIconClass(documentConfig.body.icon, "title") },
  };
}

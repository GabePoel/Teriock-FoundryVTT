import { makeIconClass } from "../../helpers/utils.mjs";
import { BaseApplicationMixin } from "../shared/mixins/_module.mjs";

const { DialogV2 } = foundry.applications.api;

/** @inheritDoc */
export default class TeriockDialog extends BaseApplicationMixin(DialogV2) {
  /**
   * @inheritDoc
   * @type {Partial<ApplicationConfiguration>}
   */
  static DEFAULT_OPTIONS = {
    window: {
      icon: makeIconClass("pen", "title"),
    },
  };
}

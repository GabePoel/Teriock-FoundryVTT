import { icons } from "../../constants/display/icons.mjs";
import { makeIconClass } from "../../helpers/icon.mjs";
import { BaseApplicationMixin } from "./mixins/_module.mjs";

const { DialogV2 } = foundry.applications.api;

/**
 * @extends {DialogV2}
 * @mixes BaseApplication
 */
export default class TeriockDialog extends BaseApplicationMixin(DialogV2) {
  /** @type {Partial<ApplicationConfiguration>} */
  static DEFAULT_OPTIONS = { window: { icon: makeIconClass(icons.ui.edit, "title") } };
}

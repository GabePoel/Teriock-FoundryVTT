import { icons } from "../../constants/display/_module.mjs";
import { makeIconClass } from "../../helpers/icon.mjs";
import { BaseApplicationMixin } from "./mixins/_module.mjs";

const { DialogV2 } = foundry.applications.api;

/**
 * @import { ApplicationConfiguration } from "@client/applications/_types.mjs";
 */

/**
 * @mixes BaseApplication
 */
export default class TeriockDialog extends BaseApplicationMixin(DialogV2) {
  /** @type {Partial<ApplicationConfiguration>} */
  static DEFAULT_OPTIONS = { window: { icon: makeIconClass(icons.manifest.ui.edit, "title") } };
}

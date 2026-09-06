import { icons } from "../../constants/display/_module.mjs";
import { mixClasses } from "../../helpers/construction.mjs";
import { makeIconClass } from "../../helpers/icon.mjs";
import { BaseApplicationMixin } from "./mixins/_module.mjs";

const { DialogV2 } = foundry.applications.api;

/**
 * @import { ApplicationConfiguration } from "@client/applications/_types.mjs";
 */

/**
 * @mixes BaseApplication
 */
export default class TeriockDialog extends mixClasses(DialogV2, BaseApplicationMixin) {
  /** @type {Partial<ApplicationConfiguration>} */
  static DEFAULT_OPTIONS = { window: { icon: makeIconClass(icons.manifest.ui.edit, "title") } };
}

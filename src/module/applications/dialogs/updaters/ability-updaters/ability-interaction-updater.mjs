import { icons } from "../../../../constants/display/_module.mjs";
import { makeIconClass } from "../../../../helpers/icon.mjs";
import BaseUpdater from "../base-updater.mjs";

/**
 * @import { ApplicationConfiguration } from "@client/applications/_types.mjs";
 */

/**
 * Dialog for updating an ability's interaction and feat save attribute.
 * @property {TeriockActiveEffect<"ability">} document
 */
export default class AbilityInteractionUpdater extends BaseUpdater {
  /** @type {Partial<ApplicationConfiguration & Teriock.Sheet._SheetConfiguration>} */
  static DEFAULT_OPTIONS = { window: { icon: makeIconClass(icons.manifest.ability.interaction, "title") } };

  /** @inheritDoc */
  get _dataPaths() {
    return ["system.interaction", "system.featSaveAttribute"];
  }

  /** @inheritDoc */
  get _formPaths() {
    const paths = ["system.interaction"];
    if (this._currentData.system.interaction === "feat") { paths.push("system.featSaveAttribute"); }
    return paths;
  }
}

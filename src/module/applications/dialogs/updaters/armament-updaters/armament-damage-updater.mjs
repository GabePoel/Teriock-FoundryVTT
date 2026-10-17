import { BaseUpdater } from "../_module.mjs";
import { icons } from "../../../../static/display/_module.mjs";
import { makeIconClass } from "../../../../utils/_module.mjs";

/**
 * @import { ApplicationConfiguration } from "@client/applications/_types.mjs";
 */

/**
 * Dialog for updating armament damage formulas.
 * @property {TeriockItem<"equipment">} document
 */
export default class ArmamentDamageUpdater extends BaseUpdater {
  /** @type {Partial<ApplicationConfiguration & Teriock.Sheet._SheetConfiguration>} */
  static DEFAULT_OPTIONS = {
    window: {
      icon: makeIconClass(icons.manifest.ui.damage, "title"),
      title: "TERIOCK.SYSTEMS.Armament.FIELDS.damage.label",
    },
  };

  /** @inheritDoc */
  get _dataPaths() {
    return ["system.damage.base", "system.damage.twoHanded"];
  }

  /** @inheritDoc */
  async _preparePartContext(partId, context, options) {
    context = await super._preparePartContext(partId, context, options);
    if (partId === "form") {
      const twoHandedPath = "system.damage.twoHanded";
      for (const field of context.fields) {
        if (field.name === twoHandedPath) {
          field.placeholder = this._currentData.system.damage.base || _loc("COMMON.None");
        }
      }
    }
    return context;
  }
}

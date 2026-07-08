import { BaseUpdater } from "../_module.mjs";
import { icons } from "../../../../constants/display/icons.mjs";
import { makeIconClass } from "../../../../helpers/icon.mjs";

/**
 * Dialog for updating armament damage formulas.
 * @property {TeriockEquipment} document
 */
export default class ArmamentDamageUpdater extends BaseUpdater {
  /** @type {Partial<ApplicationConfiguration & Teriock.Sheet._SheetConfiguration>} */
  static DEFAULT_OPTIONS = { window: { icon: makeIconClass(icons.ui.damage, "title") } };

  /** @inheritDoc */
  get _dataPaths() {
    return ["system.damage.base", "system.damage.twoHanded"];
  }

  /** @inheritDoc */
  get _titlePrefix() {
    return "TERIOCK.SYSTEMS.Armament.FIELDS.damage.label";
  }

  /** @inheritDoc */
  async _preparePartContext(partId, context, options) {
    context = await super._preparePartContext(partId, context, options);
    if (partId === "form") {
      const twoHandedPath = "system.damage.twoHanded";
      for (const field of context.fields) {
        if (field.name === twoHandedPath) {
          field.placeholder = this._currentData.system.damage.base;
        }
      }
    }
    return context;
  }
}

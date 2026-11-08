import { BaseUpdater } from "../_module.mjs";
import { RangeUnitModel } from "../../../../data/models/unit-models/_module.mjs";
import { makeIconClass } from "../../../../utils/_module.mjs";

/**
 * @import { ApplicationConfiguration } from "@client/applications/_types.mjs";
 */

/**
 * Dialog for updating armament long and short range.
 * @property {TeriockItem<"equipment">} document
 */
export default class ArmamentRangeUpdater extends BaseUpdater {
  /** @type {Partial<ApplicationConfiguration & Teriock.Sheet._SheetConfiguration>} */
  static DEFAULT_OPTIONS = {
    window: {
      icon: makeIconClass(TERIOCK.DISPLAY.icons.manifest.ability.range, "title"),
      title: "TERIOCK.SYSTEMS.Armament.FIELDS.range.label",
    },
  };

  /** @inheritDoc */
  get _dataPaths() {
    return ["system.range.long", "system.range.short.raw"];
  }

  /** @inheritDoc */
  get _formPaths() {
    const paths = ["system.range.long"];
    if (RangeUnitModel.finiteChoiceEntries.some(e => e.id === this._currentData.system.range.long.unit)) {
      paths.push("system.range.short.raw");
    }
    return paths;
  }

  /** @inheritDoc */
  _prepareFieldContext(path) {
    const context = super._prepareFieldContext(path);
    if (path === "system.range.short.raw") {
      Object.assign(context, { hint: "", label: "TERIOCK.SYSTEMS.Armament.FIELDS.range.short.raw.label" });
    }
    return context;
  }
}

import { BaseUpdater } from "../_module.mjs";
import { icons } from "../../../../constants/display/icons.mjs";
import { RangeModel } from "../../../../data/models/unit-models/_module.mjs";
import { makeIconClass } from "../../../../helpers/icon.mjs";

/**
 * Dialog for updating armament long and short range.
 * @property {TeriockEquipment} document
 */
export default class ArmamentRangeUpdater extends BaseUpdater {
  /** @type {Partial<ApplicationConfiguration & Teriock.Sheet._SheetConfiguration>} */
  static DEFAULT_OPTIONS = { window: { icon: makeIconClass(icons.ability.range, "title") } };

  /** @inheritDoc */
  get _dataPaths() {
    return ["system.range.long.unit", "system.range.short.raw", "system.range.long.raw"];
  }

  /** @inheritDoc */
  get _formPaths() {
    const paths = ["system.range.long.unit"];
    if (RangeModel.finiteChoiceEntries.some(e => e.id === this._currentData.system.range.long.unit)) {
      paths.push(...["system.range.short.raw", "system.range.long.raw"]);
    }
    return paths;
  }

  /** @inheritDoc */
  get _titlePrefix() {
    return "TERIOCK.SYSTEMS.Armament.FIELDS.range.label";
  }

  /** @inheritDoc */
  async _preparePartContext(partId, context, options) {
    context = await super._preparePartContext(partId, context, options);
    if (partId !== "form") { return context; }

    const labels = {
      "system.range.long.raw": "TERIOCK.SYSTEMS.Armament.FIELDS.range.long.raw.alt",
      "system.range.short.raw": "TERIOCK.SYSTEMS.Armament.FIELDS.range.short.raw.label",
    };

    for (const fieldContext of context.fields) {
      const parentLabel = labels[fieldContext.name];
      if (!parentLabel) { continue; }
      if (fieldContext.name.endsWith(".unit")) {
        fieldContext.label = `${_loc(parentLabel)} ${_loc("TERIOCK.MODELS.BaseUnit.FIELDS.unit.label")}`;
      } else {
        fieldContext.label = `${_loc(parentLabel)} ${_loc("TERIOCK.MODELS.BaseUnit.FIELDS.raw.label")}`;
      }
    }
    return context;
  }
}

import documentConfig from "../../../constants/config/document-config.mjs";
import { mixClasses } from "../../../helpers/construction.mjs";
import { formulaExists } from "../../../helpers/formula.mjs";
import { makeIconClass } from "../../../helpers/icon.mjs";
import { secondaryFormat } from "../../../helpers/localization.mjs";
import * as mixins from "../mixins/_module.mjs";
import ArmamentSheet from "./armament-sheet.mjs";

/**
 * Sheet for a {@link TeriockEquipment}.
 * @extends {ArmamentSheet}
 * @mixes EquipmentDropSheet
 * @property {TeriockEquipment} document
 */
export default class EquipmentSheet extends mixClasses(ArmamentSheet, mixins.EquipmentDropSheetMixin) {
  /** @type {string[]} */
  static BARS = [
    "teriock/sheets/items/equipment/status-bar",
    ...super.BARS,
    "teriock/sheets/items/equipment/load-bar",
    "teriock/sheets/shared/bars/consumable-bar",
    "teriock/sheets/items/equipment/ammunition-bar",
    "teriock/sheets/items/equipment/storage-bar",
  ];

  /** @type {Partial<ApplicationConfiguration & Teriock.Sheet._SheetConfiguration>} */
  static DEFAULT_OPTIONS = {
    classes: ["equipment"],
    window: { icon: makeIconClass(documentConfig.equipment.icon, "title") },
  };

  /** @inheritDoc */
  async _prepareContext(options) {
    return Object.assign(await super._prepareContext(options), {
      rangeString: this.document.system.range.long.unitType === "finite"
        ? secondaryFormat(this.document.system.range.long.formula, this.document.system.range.short.formula, {
          reverse: true,
          secondFilter: formulaExists,
        })
        : this.document.system.range.long.text,
      sourceRangeString: this.document.system.range.long.unitType === "finite"
        ? secondaryFormat(this.document.system._source.range.long.raw, this.document.system._source.range.short.raw, {
          reverse: true,
          secondFilter: formulaExists,
        })
        : this.document.system.range.long.text,
    });
  }
}

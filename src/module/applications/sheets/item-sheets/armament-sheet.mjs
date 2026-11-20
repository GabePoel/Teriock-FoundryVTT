import { FormulaField } from "../../../data/fields/_module.mjs";
import { secondaryFormat } from "../../../helpers/localization.mjs";
import { ChildSheet } from "../utility-sheets/_module.mjs";

/**
 * Armament sheet
 * @property {TeriockItem<"body"|"equipment">} document
 */
export default class ArmamentSheet extends ChildSheet {
  /** @type {string[]} */
  static BARS = ["teriock/sheets/items/body/status-bar", "teriock/sheets/shared/bars/armament-bars"];

  /** @inheritDoc */
  async _prepareContext(options) {
    const sourceLong = this.document.system.range.long.clone();
    return Object.assign(await super._prepareContext(options), {
      damage: {
        data: secondaryFormat(this.document.system.damage.base || "0", this.document.system.damage.twoHanded, {
          secondFilter: FormulaField.exists,
        }),
        source: secondaryFormat(
          this.document.system._source.damage.base || "0",
          this.document.system._source.damage.twoHanded,
          { secondFilter: FormulaField.exists },
        ),
      },
      range: {
        data: this.document.system.range.long.unitType === "finite"
          ? secondaryFormat(this.document.system.range.long.raw, this.document.system.range.short.raw, {
            reverse: true,
            secondFilter: FormulaField.exists,
          })
          : this.document.system.range.long.label,
        source: sourceLong.unitType === "finite"
          ? secondaryFormat(sourceLong.raw, this.document.system._source.range.short.raw, {
            reverse: true,
            secondFilter: FormulaField.exists,
          })
          : sourceLong.label,
      },
    });
  }
}

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
    const system = this.document.system;
    const long = system.range.long;
    const sourceLong = long.clone();
    const reach = system.range.reach;
    const sourceReach = reach.clone();
    return Object.assign(await super._prepareContext(options), {
      damage: {
        data: secondaryFormat(system.damage.base || "0", system.damage.twoHanded, {
          secondFilter: FormulaField.exists,
        }),
        source: secondaryFormat(system._source.damage.base || "0", system._source.damage.twoHanded, {
          secondFilter: FormulaField.exists,
        }),
      },
      range: {
        data: long.unitType !== "finite"
          ? long.label
          : FormulaField.exists(long.raw)
          ? secondaryFormat(long.raw, system.range.short.raw, { reverse: true, secondFilter: FormulaField.exists })
          : "",
        source: sourceLong.unitType !== "finite"
          ? sourceLong.label
          : FormulaField.exists(sourceLong.raw)
          ? secondaryFormat(sourceLong.raw, system._source.range.short.raw, {
            reverse: true,
            secondFilter: FormulaField.exists,
          })
          : "",
      },
      reach: {
        data: reach.unitType !== "finite"
          ? reach.label
          : Number.isNumeric(reach.raw)
          ? Number(reach.raw).signedString()
          : reach.raw,
        source: sourceReach.unitType !== "finite"
          ? sourceReach.label
          : Number.isNumeric(sourceReach.raw)
          ? Number(sourceReach.raw).signedString()
          : sourceReach.raw,
      },
    });
  }
}

/**
 * Re-render sheets to show updated imbuement durations.
 * @see {@link hookEvents.updateWorldTime}
 */
async function updateRegionDurations() {
  for (const app of foundry.applications.instances.values()) {
    if (app instanceof ArmamentSheet && app.document.previewedTypes.imbuement.length) {
      app.render();
    }
  }
}
Hooks.on("updateWorldTime", updateRegionDurations);

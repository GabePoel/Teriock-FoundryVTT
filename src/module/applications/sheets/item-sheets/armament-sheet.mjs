import { formulaExists } from "../../../helpers/formula.mjs";
import { secondaryFormat } from "../../../helpers/localization.mjs";
import { ArmamentDamageUpdater, ArmamentRangeUpdater } from "../../dialogs/updaters/armament-updaters/_module.mjs";
import { ChildSheet } from "../utility-sheets/_module.mjs";

/**
 * @import { ApplicationConfiguration } from "@client/applications/_types.mjs";
 */

/**
 * Armament sheet
 * @property {TeriockItem<"body"|"equipment">} document
 */
export default class ArmamentSheet extends ChildSheet {
  /**
   * Edit armament damage formulas.
   * @returns {Promise<void>}
   */
  static async #onUpdateArmamentDamage() {
    if (!game.teriock.checkEditable(this)) { return; }
    await ArmamentDamageUpdater.create({ document: this.document });
  }

  /**
   * Edit armament ranges.
   * @returns {Promise<void>}
   */
  static async #onUpdateArmamentRange() {
    if (!game.teriock.checkEditable(this)) { return; }
    await ArmamentRangeUpdater.create({ document: this.document });
  }

  /** @type {string[]} */
  static BARS = ["teriock/sheets/shared/bars/status-bar", "teriock/sheets/shared/bars/armament-bars"];

  /** @type {Partial<ApplicationConfiguration & Teriock.Sheet._SheetConfiguration>} */
  static DEFAULT_OPTIONS = {
    actions: { updateArmamentDamage: this.#onUpdateArmamentDamage, updateArmamentRange: this.#onUpdateArmamentRange },
  };

  /** @inheritDoc */
  async _prepareContext(options) {
    return Object.assign(await super._prepareContext(options), {
      damage: {
        data: secondaryFormat(this.document.system.damage.base || "0", this.document.system.damage.twoHanded, {
          secondFilter: formulaExists,
        }),
        source: secondaryFormat(
          this.document.system._source.damage.base || "0",
          this.document.system._source.damage.twoHanded,
          { secondFilter: formulaExists },
        ),
      },
    });
  }
}

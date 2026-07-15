import { formulaExists } from "../../../helpers/formula.mjs";
import { secondaryFormat } from "../../../helpers/localization.mjs";
import { ArmamentDamageUpdater, ArmamentRangeUpdater } from "../../dialogs/updaters/armament-updaters/_module.mjs";
import { ChildSheet } from "../utility-sheets/_module.mjs";

/**
 * Sheet for a {@link TeriockArmament}
 * @extends {ChildSheet}
 * @property {TeriockArmament} document
 */
export default class ArmamentSheet extends ChildSheet {
  /**
   * Edit armament damage formulas.
   * @returns {Promise<void>}
   */
  static async #onEditArmamentDamage() {
    if (!this.isEditable) { return; }
    await ArmamentDamageUpdater.create({ document: this.document });
  }

  /**
   * Edit armament ranges.
   * @returns {Promise<void>}
   */
  static async #onEditArmamentRange() {
    if (!this.isEditable) { return; }
    await ArmamentRangeUpdater.create({ document: this.document });
  }

  /** @type {string[]} */
  static BARS = ["teriock/sheets/shared/bars/armament-bars"];

  /** @type {Partial<ApplicationConfiguration & Teriock.Sheet._SheetConfiguration>} */
  static DEFAULT_OPTIONS = {
    actions: { editArmamentDamage: this.#onEditArmamentDamage, editArmamentRange: this.#onEditArmamentRange },
  };

  /** @inheritDoc */
  async _prepareContext(options) {
    return Object.assign(await super._prepareContext(options), {
      damageString: secondaryFormat(this.document.system.damage.base, this.document.system.damage.twoHanded, {
        secondFilter: formulaExists,
      }),
      sourceDamageString: secondaryFormat(
        this.document.system._source.damage.base,
        this.document.system._source.damage.twoHanded,
        { secondFilter: formulaExists },
      ),
    });
  }
}

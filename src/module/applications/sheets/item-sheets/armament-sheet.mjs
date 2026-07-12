import { formulaExists } from "../../../helpers/formula.mjs";
import { secondaryFormat } from "../../../helpers/localization.mjs";
import { ChildSheet } from "../utility-sheets/_module.mjs";

/**
 * Sheet for a {@link TeriockArmament}
 * @extends {ChildSheet}
 * @property {TeriockArmament} document
 */
export default class ArmamentSheet extends ChildSheet {
  /** @type {string[]} */
  static BARS = ["teriock/sheets/shared/bars/armament-bars"];

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

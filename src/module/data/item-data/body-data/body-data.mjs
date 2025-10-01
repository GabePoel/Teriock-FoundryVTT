import { TeriockRoll } from "../../../dice/_module.mjs";
import { mergeFreeze } from "../../../helpers/utils.mjs";
import { ExecutableDataMixin, WieldedDataMixin, WikiDataMixin } from "../../mixins/_module.mjs";
import TeriockBaseItemModel from "../base-item-data/base-item-data.mjs";
import { _messageParts } from "./methods/_messages.mjs";
import { _parse } from "./methods/_parsing.mjs";
import { _roll } from "./methods/_rolling.mjs";

/**
 * Body part-specific item data model.
 *
 * Relevant wiki pages:
 * - [Body Parts](https://wiki.teriock.com/index.php/Category:Body_parts)
 *
 * @extends {TeriockBaseItemModel}
 * @mixes ConsumableDataMixin
 * @mixes ExecutableDataMixin
 * @mixes WikiDataMixin
 */
export default class TeriockBodyModel extends WieldedDataMixin(
  WikiDataMixin(ExecutableDataMixin(TeriockBaseItemModel)),
) {
  /**
   * @inheritDoc
   * @type {Readonly<Teriock.Documents.ItemModelMetadata>}
   */
  static metadata = mergeFreeze(super.metadata, {
    namespace: "Body",
    pageNameKey: "name",
    type: "body",
    usable: true,
    childEffectTypes: ["property"],
  });

  /** @inheritDoc */
  get messageParts() {
    return {
      ...super.messageParts,
      ..._messageParts(this),
    };
  }

  /** @inheritDoc */
  async parse(rawHTML) {
    return await _parse(this, rawHTML);
  }

  /** @inheritDoc */
  prepareDerivedData() {
    super.prepareDerivedData();
    for (const damageOption of ["base"]) {
      const key = `damage.${damageOption}.raw`;
      const damageRoll = new TeriockRoll(foundry.utils.getProperty(this, key));
      damageRoll.terms.forEach((term) => {
        const flavorParts = new Set([
          ...term.flavor
            .toLowerCase()
            .split(" ")
            .map((p) => p.trim()),
          ...this.damage.types.map((t) => t.toLowerCase().trim()),
        ]);
        flavorParts.delete("");
        const flavorArray = Array.from(flavorParts);
        flavorArray.sort((a, b) => a.localeCompare(b));
        if (!term.isDeterministic || !isNaN(Number(term.expression))) {
          term.options.flavor = flavorArray.join(" ");
        }
      });
      foundry.utils.setProperty(this, key, damageRoll.formula);
    }
  }

  /** @inheritDoc */
  async roll(options) {
    if (game.settings.get("teriock", "rollAttackOnEquipmentUse")) {
      await this.actor?.useAbility("Basic Attack", options);
      options.advantage = false;
      options.disadvantage = false;
      options.crit = false;
    }
    await _roll(this, options);
  }
}

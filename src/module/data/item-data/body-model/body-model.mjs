import { TeriockRoll } from "../../../dice/_module.mjs";
import { dotJoin, suffix } from "../../../helpers/string.mjs";
import { mix } from "../../../helpers/utils.mjs";
import * as mixins from "../../mixins/_module.mjs";
import TeriockBaseItemModel from "../base-item-model/base-item-model.mjs";
import { _panelParts } from "./methods/_panel-parts.mjs";
import { _parse } from "./methods/_parsing.mjs";

/**
 * Body part-specific item data model.
 *
 * Relevant wiki pages:
 * - [Body Parts](https://wiki.teriock.com/index.php/Category:Body_parts)
 *
 * @extends {TeriockBaseItemModel}
 * @mixes ConsumableData
 * @mixes ExecutableData
 * @mixes WikiData
 */
export default class TeriockBodyModel extends mix(
  TeriockBaseItemModel,
  mixins.ExecutableDataMixin,
  mixins.WikiDataMixin,
  mixins.ArmamentDataMixin,
) {
  /** @inheritDoc */
  static get metadata() {
    return foundry.utils.mergeObject(super.metadata, {
      childEffectTypes: ["property"],
      indexCategoryKey: "bodyParts",
      indexCompendiumKey: "bodyParts",
      namespace: "Body",
      pageNameKey: "name",
      type: "body",
      usable: true,
      visibleTypes: ["property"],
    });
  }

  /** @inheritDoc */
  get embedParts() {
    const parts = super.embedParts;
    parts.subtitle = "Body part";
    parts.text = dotJoin([
      suffix(this.damage.base.formula, "Damage"),
      suffix(this.bv.value, "BV"),
      suffix(this.av.value, "AV"),
      this.parent.elder ? this.parent.elder?.nameString : "",
    ]);
    return parts;
  }

  /** @inheritDoc */
  get makeSuppressed() {
    let suppressed = super.makeSuppressed;
    if (this.actor && this.actor.system.isTransformed) {
      if (
        this.parent.elder?.documentName === "Actor" &&
        this.actor.system.transformation.suppression.bodyParts
      ) {
        suppressed = true;
      }
    }
    return suppressed;
  }

  /** @inheritDoc */
  get panelParts() {
    return {
      ...super.panelParts,
      ..._panelParts(this),
    };
  }

  /** @inheritDoc */
  async parse(rawHTML) {
    return await _parse(this, rawHTML);
  }

  /** @inheritDoc */
  prepareSpecialData() {
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
    super.prepareSpecialData();
  }
}

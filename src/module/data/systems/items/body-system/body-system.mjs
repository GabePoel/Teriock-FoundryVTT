import { TeriockRoll } from "../../../../dice/_module.mjs";
import { dotJoin, prefix, suffix } from "../../../../helpers/string.mjs";
import { mix } from "../../../../helpers/utils.mjs";
import * as mixins from "../../mixins/_module.mjs";
import BaseItemSystem from "../base-item-system/base-item-system.mjs";

//noinspection JSClosureCompilerSyntax
/**
 * Body part-specific item data model.
 *
 * Relevant wiki pages:
 * - [Body Parts](https://wiki.teriock.com/index.php/Category:Body_parts)
 *
 * @extends {BaseItemSystem}
 * @implements {Teriock.Models.BodySystemInterface}
 * @mixes ConsumableSystem
 * @mixes WikiSystem
 */
export default class BodySystem extends mix(
  BaseItemSystem,
  mixins.WikiSystemMixin,
  mixins.ArmamentSystemMixin,
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
      bars: [
        {
          icon: TERIOCK.display.icons.interaction.attack,
          label: "Attack",
          wrappers: [
            this.piercing.value,
            suffix(this.damage.base.typed, "damage"),
            suffix(prefix(this.hit.text, "+", ""), "hit bonus"),
            suffix(this.attackPenalty.text, "AP"),
            TERIOCK.index.weaponFightingStyles[this.fightingStyle],
          ],
        },
        {
          icon: TERIOCK.display.icons.interaction.block,
          label: "Defense",
          wrappers: [
            this.av.value ? `${this.av.value} AV` : "",
            this.bv.value ? `${this.bv.value} BV` : "",
          ],
        },
        {
          icon: TERIOCK.display.icons.equipment.equipmentClasses,
          label: "Equipment Classes",
          wrappers: [
            "Body parts",
            this.av.value ? "Armor" : "",
            this.spellTurning ? "Spell Turning" : "",
          ],
        },
      ],
    };
  }

  /** @inheritDoc */
  getLocalRollData() {
    return {
      ...super.getLocalRollData(),
      "class.bodyParts": 1,
    };
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
          ...Array.from(this.damage.types).map((t) => t.toLowerCase().trim()),
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

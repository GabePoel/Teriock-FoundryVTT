import { BaseRoll } from "../../../../dice/rolls/_module.mjs";
import { dotJoin } from "../../../../helpers/string.mjs";
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
 * @mixes ArmamentSystem
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
  get displayTags() {
    const tags = super.displayTags;
    tags.push({
      label: "TERIOCK.TERMS.EquipmentClasses.bodyParts",
      tooltip: "TERIOCK.SYSTEMS.Equipment.FIELDS.equipmentClasses.label",
    });
    if (this.av.value) {
      tags.push({
        label: "TERIOCK.TERMS.EquipmentClasses.armor",
        tooltip: "TERIOCK.SYSTEMS.Equipment.FIELDS.equipmentClasses.label",
      });
    }
    if (this.spellTurning) {
      tags.push({
        label: "TERIOCK.TERMS.Properties.spellTurning",
        tooltip: "TERIOCK.PACKS.properties",
      });
    }
    if (this.warded) {
      tags.push({
        label: "TERIOCK.TERMS.Properties.warded",
        tooltip: "TERIOCK.PACKS.properties",
      });
    }
    return tags;
  }

  /** @inheritDoc */
  get embedParts() {
    const parts = super.embedParts;
    parts.subtitle = game.i18n.localize("TYPES.Item.body");
    parts.text = dotJoin([
      ...this._damageWrappers,
      ...this._defenseBar.wrappers,
      this.parent.elder ? this.parent.elder?.nameString : "",
    ]);
    return parts;
  }

  /** @inheritDoc */
  get panelParts() {
    return {
      ...super.panelParts,
      bars: [
        this._attackBar,
        this._defenseBar,
        {
          icon: TERIOCK.display.icons.equipment.equipmentClasses,
          label: game.i18n.localize(
            "TERIOCK.SYSTEMS.Equipment.FIELDS.equipmentClasses.label",
          ),
          wrappers: [
            game.i18n.localize("TERIOCK.TERMS.EquipmentClasses.bodyParts"),
            this.av.value
              ? game.i18n.localize("TERIOCK.TERMS.EquipmentClasses.armor")
              : "",
            this.spellTurning
              ? game.i18n.localize(
                  "TERIOCK.SYSTEMS.Armament.FIELDS.spellTurning.label",
                )
              : "",
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
      const damageRoll = new BaseRoll(foundry.utils.getProperty(this, key));
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

import { BaseRoll } from "../../../../dice/rolls/_module.mjs";
import { simplifyTags } from "../../../../helpers/panel.mjs";
import { dotJoin } from "../../../../helpers/string.mjs";
import { mix } from "../../../../helpers/utils.mjs";
import * as mixins from "../../mixins/_module.mjs";
import BaseItemSystem from "../base-item-system/base-item-system.mjs";

/**
 * Body part-specific item data model.
 *
 * Relevant wiki pages:
 * - [Body Parts](https://wiki.teriock.com/index.php/Category:Body_parts)
 *
 * @extends {BaseItemSystem}
 * @extends {Teriock.Models.BodySystemData}
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
      childEffectTypes: ["ability", "property"],
      indexCategoryKey: "bodyParts",
      indexCompendiumKey: "bodyParts",
      namespace: "Body",
      pageNameKey: "name",
      type: "body",
      usable: true,
      visibleTypes: ["ability", "property"],
    });
  }

  /** @inheritDoc */
  get embedParts() {
    const parts = super.embedParts;
    parts.subtitle = game.i18n.localize("TYPES.Item.body");
    parts.text = dotJoin([
      ...this._damageWrappers,
      ...this._defenseBar.wrappers,
      this.parent.elder
        ? this.parent.elder?.documentName !== "Actor"
          ? this.parent.elder?.fullName
          : ""
        : "",
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
            this.range.description,
            ...simplifyTags(this._equipmentClassesTags),
            ...simplifyTags(this._armamentTags),
          ],
        },
      ],
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
    this.equipmentClasses.add("bodyParts");
    if (this.av.value) this.equipmentClasses.add("armor");
    super.prepareSpecialData();
  }
}

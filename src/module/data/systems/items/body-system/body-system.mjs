import { simplifyTags } from "../../../../helpers/panel.mjs";
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
    return Object.assign(super.embedParts, {
      subtitle: game.i18n.localize("TYPES.Item.body"),
    });
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
    this.equipmentClasses.add("bodyParts");
    if (this.av.value) this.equipmentClasses.add("armor");
    super.prepareSpecialData();
  }
}

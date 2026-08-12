import effectConfig from "../../../../constants/config/effect-config.mjs";
import systemConfig from "../../../../constants/config/system-config.mjs";
import { mixClasses } from "../../../../helpers/construction.mjs";
import { simplifyTags } from "../../../../helpers/panel.mjs";
import { toCamelCase } from "../../../../helpers/string.mjs";
import * as systemMixins from "../../mixins/_module.mjs";
import BaseItemSystem from "../base-item-system/base-item-system.mjs";

/**
 * Body part-specific item data model.
 *
 * Relevant wiki pages:
 * - [Body Parts](https://wiki.teriock.com/index.php/Category:Body_parts)
 *
 * @mixes WikiSystem
 * @mixes ArmamentSystem
 */
export default class BodySystem
  extends mixClasses(BaseItemSystem, systemMixins.WikiSystemMixin, systemMixins.ArmamentSystemMixin)
{
  /** @inheritDoc */
  static get metadata() {
    return foundry.utils.mergeObject(super.metadata, { initialKind: "intrinsic", type: "body", usable: true });
  }

  /** @inheritDoc */
  static kinds() {
    return { intrinsic: effectConfig.kind.intrinsic, ...systemConfig.defaultKinds };
  }

  /** @inheritDoc */
  get embedParts() {
    return Object.assign(super.embedParts, { subtitle: _loc("TYPES.Item.body") });
  }

  /** @inheritDoc */
  get wikiPage() {
    return `Body:${TERIOCK.index.bodyParts[toCamelCase(this.identifier ?? "")] ?? ""}`;
  }

  /** @inheritDoc */
  async getPanelParts() {
    return {
      ...(await super.getPanelParts()),
      bars: this._withKindBar([this._attackBar, this._defenseBar, {
        icon: TERIOCK.display.icons.equipment.equipmentClasses,
        label: _loc("TERIOCK.SYSTEMS.Equipment.FIELDS.equipmentClasses.label"),
        wrappers: [
          this.range.description,
          ...simplifyTags(this._equipmentClassesTags),
          ...simplifyTags(this._armamentTags),
        ],
      }]),
    };
  }

  /** @inheritDoc */
  prepareSpecialData() {
    this.equipmentClasses.add("bodyParts");
    if (this.av.value) { this.equipmentClasses.add("armor"); }
    super.prepareSpecialData();
  }
}

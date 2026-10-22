import { mergeMetadata, mixClasses } from "../../../utils/_module.mjs";
import { Panel } from "../../pseudo-documents/_module.mjs";
import { ArmamentSystemMixin, WikiSystemMixin } from "../mixins/_module.mjs";
import BaseItemSystem from "./base-item-system/base-item-system.mjs";

/**
 * Body part-specific item data model.
 *
 * Relevant wiki pages:
 * - [Body Parts](https://wiki.teriock.com/index.php/Category:Body_parts)
 *
 * @extends {BaseItemSystem}
 * @mixes WikiSystem
 * @mixes ArmamentSystem
 */
export default class BodySystem extends mixClasses(BaseItemSystem, WikiSystemMixin, ArmamentSystemMixin) {
  /** @inheritDoc */
  static metadata = mergeMetadata(super.metadata, {
    icon: TERIOCK.DISPLAY.icons.manifest.document.body,
    img: TERIOCK.DISPLAY.thumbnails.manifest.document.body,
    importable: true,
    initialKind: "intrinsic",
    kinds: _replace({ intrinsic: TERIOCK.CONFIG.effect.kind.intrinsic, ...TERIOCK.CONFIG.system.defaultKinds }),
    tags: { usable: true },
    type: "body",
  });

  /** @inheritDoc */
  get embedParts() {
    return Object.assign(super.embedParts, { subtitle: _loc("TYPES.Item.body") });
  }

  /** @inheritDoc */
  async getPanelParts() {
    return {
      ...(await super.getPanelParts()),
      bars: this._withKindBar([this._attackBar, this._defenseBar, {
        icon: TERIOCK.DISPLAY.icons.manifest.equipment.equipmentClasses,
        label: _loc("TERIOCK.SYSTEMS.Equipment.FIELDS.equipmentClasses.label"),
        wrappers: [
          this.range.description,
          ...Panel.simplifyTags(this._equipmentClassesTags),
          ...Panel.simplifyTags(this._armamentTags),
        ],
      }]),
    };
  }

  /** @inheritDoc */
  prepareSpecialData() {
    this.equipmentClasses.add("body-parts");
    if (this.av.value) { this.equipmentClasses.add("armor"); }
    super.prepareSpecialData();
  }
}

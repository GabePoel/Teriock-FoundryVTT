import { mergeMetadata, mixClasses } from "../../../utils/_module.mjs";
import { MorphSystemMixin } from "../mixins/_module.mjs";
import { ApplicableEffectSystem } from "./abstract/_module.mjs";
import ConsequenceSystem from "./consequence-system/consequence-system.mjs";

/**
 * Holiday-specific effect data model.
 * @extends {ApplicableEffectSystem}
 * @mixes MorphSystem
 */
export default class HolidaySystem extends mixClasses(ApplicableEffectSystem, MorphSystemMixin) {
  /** @inheritDoc */
  static metadata = mergeMetadata(super.metadata, {
    childTypes: ConsequenceSystem.metadata.childTypes,
    icon: TERIOCK.DISPLAY.icons.manifest.document.holiday,
    img: TERIOCK.DISPLAY.thumbnails.manifest.document.holiday,
    initialKind: "echo",
    kinds: _replace(TERIOCK.CONFIG.effect.kind),
    type: "holiday",
  });

  /** @inheritDoc */
  async _preCreate(data, options, user) {
    const yes = await super._preCreate(data, options, user);
    if (yes === false) { return false; }

    this.parent.updateSource(
      foundry.utils.mergeObject({ system: { effectTypes: ["world"], powerSources: ["divine"] } }, data),
    );
  }
}

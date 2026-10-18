import { mergeMetadata, mixClasses } from "../../../../utils/_module.mjs";
import { BaseSystemMixin, UncommonSystemMixin } from "../../mixins/_module.mjs";

const { TypeDataModel } = foundry.abstract;

/**
 * Base CombatantGroup data model.
 * @extends {TypeDataModel}
 * @mixes BaseSystem
 * @mixes UncommonSystem
 */
export default class BaseGroupSystem extends mixClasses(TypeDataModel, BaseSystemMixin, UncommonSystemMixin) {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.SYSTEMS.CombatantGroup"];

  /** @inheritDoc */
  static metadata = mergeMetadata(super.metadata, { documentName: "CombatantGroup" });

  /**
   * The commander of this group.
   * @returns {TeriockCombatant|null}
   */
  get commander() {
    return null;
  }

  /**
   * The minions under the commander's command.
   * @returns {TeriockCombatant[]}
   */
  get minions() {
    return [];
  }
}

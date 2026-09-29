import TeriockCombatant from "../../../../documents/combatant/combatant.mjs";
import { mergeMetadata, mixClasses } from "../../../../helpers/construction.mjs";
import { BaseSystemMixin, UncommonSystemMixin } from "../../mixins/_module.mjs";

const { TypeDataModel } = foundry.abstract;
const { fields } = foundry.data;

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
  static metadata = mergeMetadata(super.metadata, { documentName: "CombatantGroup", type: "base" });

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), { commanderId: new fields.ForeignDocumentField(TeriockCombatant) });
  }

  /**
   * The commander of this group.
   * @returns {TeriockCombatant|null}
   */
  get commander() {
    const commander = this.parent.parent?.combatants.get(this.commanderId);
    return commander?.group?.id === this.parent.id ? commander : null;
  }

  /**
   * The minions under the commander's command.
   *
   * Relevant wiki pages:
   * - [Minions](https://wiki.teriock.com/index.php?title=Core:Minions)
   *
   * @returns {TeriockCombatant[]}
   */
  get minions() {
    return this.parent.members.filter(c => c.id !== this.commanderId);
  }
}

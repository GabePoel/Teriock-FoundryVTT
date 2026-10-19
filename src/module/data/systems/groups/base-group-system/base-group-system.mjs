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
   * Gets the default name for a new CombatantGroup of this type.
   * @param {object} [_context] - The context for which to create the Document name.
   * @param {string} [_context.type] - The subtype of the document
   * @param {TeriockCombat|null} [_context.parent] - A parent document within which the created Document should belong
   * @param {string|null} [_context.pack] - A compendium pack within which the Document should be created
   * @param {TeriockCombatant} [_context.commander] - Commander of the CombatantGroup
   * @param {TeriockCombatant[]} [_context.members] - Combatants forming the CombatantGroup
   * @returns {string|null}
   */
  static defaultName(_context) {
    return null;
  }

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

  /** @inheritDoc */
  async _preCreate(data, options, user) {
    const yes = await super._preCreate(data, options, user);
    if (yes === false) { return false; }

    this.parent.updateSource(foundry.utils.mergeObject({ img: this.metadata.img }, data));
  }
}

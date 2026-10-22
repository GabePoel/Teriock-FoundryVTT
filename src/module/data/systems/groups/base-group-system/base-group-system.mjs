import { mergeMetadata, mixClasses } from "../../../../utils/_module.mjs";
import { Panel } from "../../../pseudo-documents/_module.mjs";
import { BaseSystemMixin, UncommonSystemMixin } from "../../mixins/_module.mjs";

const { TypeDataModel } = foundry.abstract;

/**
 * Get the words shared by several names.
 * @param {string[][]} lists
 * @returns {string[]}
 */
function getSharedWords(lists) {
  const end = lists[0].findIndex((word, i) => lists.some(l => l[i] !== word));
  return lists[0].slice(0, end < 0 ? undefined : end);
}

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
  static metadata = mergeMetadata(super.metadata, {
    documentName: "CombatantGroup",
    icon: TERIOCK.DISPLAY.icons.manifest.document.group,
    img: TERIOCK.DISPLAY.thumbnails.manifest.document.group,
    type: "base",
  });

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
  static defaultName({ members = [] }) {
    if (!members.length) { return null; }
    // Ignore the automatic incrementing numbers that Foundry can be configured to add to tokens
    const words = members.map(m => m.name.trim().split(/\s+/).filter(w => !/^\(?\d+\)?$/.test(w)));
    const shared = getSharedWords(words).join(" ")
      || getSharedWords(words.map(w => w.toReversed())).toReversed().join(" ");
    return shared
      ? _loc("TERIOCK.COMBAT.Group.name", {
        name: shared,
        type: _loc(CONFIG.CombatantGroup.typeLabels[this.metadata.type]),
      })
      : null;
  }

  /** @inheritDoc */
  get _color() {
    return this.parent.face?.token?.color ?? null;
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

  /** @inheritDoc */
  async getPanelParts() {
    const members = this.parent.turnMembers.filter(m => m.visible);
    return Object.assign(await super.getPanelParts(), {
      associations: [{
        cards: members.map(m => ({
          ...Panel.toAssociationCard(m),
          badge: _loc("TERIOCK.SYSTEMS.Combatant.PANELS.attackPenalty", { value: m.system.attackPenalty }),
        })),
        icon: TERIOCK.DISPLAY.icons.manifest.document.combatant,
        title: _loc("TERIOCK.COMBAT.Group.members"),
      }],
      bars: [{
        icon: TERIOCK.DISPLAY.icons.manifest.ui.info,
        label: _loc("TERIOCK.SYSTEMS.Ability.PANELS.info"),
        wrappers: [
          this.parent.typeLabel,
          _loc(`TERIOCK.SYSTEMS.CombatantGroup.PANELS.members.${game.i18n.pluralRules.select(members.length)}`, {
            value: members.length,
          }),
        ],
      }, {
        icon: TERIOCK.DISPLAY.icons.manifest.interaction.attack,
        label: _loc("TERIOCK.COMBAT.Event.combat"),
        wrappers: [
          Number.isFinite(this.parent.initiative)
            ? _loc("TERIOCK.SYSTEMS.Combatant.PANELS.initiative", { value: this.parent.initiative })
            : "",
        ],
      }],
      color: this.color,
      name: this.parent.name || this.parent.face?.name,
    });
  }
}

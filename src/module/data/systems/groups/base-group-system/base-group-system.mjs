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
 * @category Groups
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
    const colors = new Set(
      [...this.parent.members].filter(m => m.visible).map(m => m.system._color?.valueOf() ?? null),
    );
    return colors.size === 1 ? colors.first() : null;
  }

  /**
   * Whether members of this CombatantGroup can share rolls.
   * @returns {boolean}
   */
  get canShareRolls() {
    return false;
  }

  /**
   * The member that commands this CombatantGroup.
   * @returns {TeriockCombatant|null}
   */
  get commander() {
    return null;
  }

  /**
   * The member that holds this CombatantGroup's place in the turn order.
   * @returns {TeriockCombatant|null}
   */
  get turnHolder() {
    const members = this.turnMembers;
    return members.find(m => !m.isDefeated) ?? members[0] ?? null;
  }

  /**
   * The members that act on this CombatantGroup's turn.
   * @returns {TeriockCombatant[]}
   */
  get turnMembers() {
    return [...this.parent.members].sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Check whether a Combatant is a minion in this CombatantGroup..
   * @param {TeriockCombatant} _combatant
   * @returns {boolean}
   */
  checkIfMinion(_combatant) {
    return false;
  }

  /** @inheritDoc */
  async getPanelParts() {
    const members = this.turnMembers.filter(m => m.visible);
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
    });
  }

  /**
   * Get the ownership level a user has over this CombatantGroup through its members.
   * @param {TeriockUser} user
   * @returns {DocumentOwnershipNumber}
   */
  getUserLevel(user) {
    return Math.max(CONST.DOCUMENT_OWNERSHIP_LEVELS.NONE, ...[...this.parent.members].map(m => m.getUserLevel(user)));
  }

  /**
   * Prepare data derived from members that should be displayed to the current user. The parent Combat calls this once
   * all of its Combatants are prepared.
   * @remarks This should ONLY be used for data that is safe to display differently to different users.
   */
  prepareDisplayData() {
    const visible = [...this.parent.members].filter(m => m.visible);
    if (!this.parent._source.img) {
      const thumbnails = new Set(visible.map(m => m.img));
      this.parent.img = (thumbnails.size === 1 && thumbnails.first()) || this.metadata.img;
    }
    if (!this.parent._source.name) {
      this.parent.name = this.constructor.defaultName({ members: visible }) || this.parent.typeLabel;
    }
  }
}

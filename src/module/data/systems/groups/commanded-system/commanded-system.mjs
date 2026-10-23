import TeriockCombatant from "../../../../documents/combatant/combatant.mjs";
import { mergeMetadata } from "../../../../utils/_module.mjs";
import { LocalDocumentField } from "../../../fields/_module.mjs";
import BaseGroupSystem from "../base-group-system/base-group-system.mjs";

/**
 * A bunch of minions that act on their commander's turn.
 *
 * Relevant wiki pages:
 * - [Minions](https://wiki.teriock.com/index.php?title=Core:Minions)
 */
export default class CommandedSystem extends BaseGroupSystem {
  /** @inheritDoc */
  static metadata = mergeMetadata(super.metadata, {
    icon: TERIOCK.DISPLAY.icons.manifest.document.commanded,
    img: TERIOCK.DISPLAY.thumbnails.manifest.document.commanded,
    type: "commanded",
  });

  /** @inheritDoc */
  static defaultName({ commander }) {
    return commander ? _loc("TERIOCK.COMBAT.Group.commanded", { name: commander?.name }) : null;
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      commanderId: new LocalDocumentField(TeriockCombatant, { idOnly: true }),
    });
  }

  /** @inheritDoc */
  get commander() {
    const commander = this.parent.parent?.combatants.get(this.commanderId);
    return commander?.group === this.parent ? commander : null;
  }

  /** @inheritDoc */
  get turnMembers() {
    const commander = this.commander;
    return super.turnMembers.sort((a, b) => Number(b === commander) - Number(a === commander));
  }

  /** @inheritDoc */
  async _preCreate(data, options, user) {
    const yes = await super._preCreate(data, options, user);
    if (yes === false) { return false; }

    const img = this.parent.parent?.combatants.get(this.commanderId)?.img;
    if (!data.img && img) { this.parent.updateSource({ img }); }
  }

  /** @inheritDoc */
  async getPanelParts() {
    const parts = await super.getPanelParts();
    const cards = parts.associations[0].cards;
    const isCommander = card => card.documentUuid === this.commander?.uuid;
    parts.associations = [{
      cards: cards.filter(isCommander),
      icon: TERIOCK.DISPLAY.icons.manifest.combat.commander,
      title: _loc("TERIOCK.SYSTEMS.CombatantGroup.FIELDS.commanderId.label"),
    }, {
      cards: cards.filter(c => !isCommander(c)),
      icon: TERIOCK.DISPLAY.icons.manifest.combat.minion,
      title: _loc("TERIOCK.COMBAT.Group.minions"),
    }].filter(a => a.cards.length);
    return parts;
  }
}

import TeriockCombatant from "../../../../documents/combatant/combatant.mjs";
import { icons, thumbnails } from "../../../../static/display/_module.mjs";
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
    icon: icons.manifest.document.commanded,
    img: thumbnails.manifest.document.commanded,
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
  get minions() {
    return [...this.parent.members].filter(c => c.id !== this.commanderId);
  }

  /** @inheritDoc */
  async _preCreate(data, options, user) {
    const yes = await super._preCreate(data, options, user);
    if (yes === false) { return false; }

    const img = this.parent.parent?.combatants.get(this.commanderId)?.img;
    if (!data.img && img) { this.parent.updateSource({ img }); }
  }
}

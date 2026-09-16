import { mergeMetadata } from "../../../helpers/construction.mjs";
import { LocalDocumentField } from "../../fields/_module.mjs";
import BaseGroupSystem from "./base-group-system.mjs";

export default class CommandedSystem extends BaseGroupSystem {
  /** @inheritDoc */
  static metadata = mergeMetadata(super.metadata, { type: "commanded" });

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      commanderId: new LocalDocumentField(foundry.documents.BaseCombatant, { idOnly: true }),
    });
  }

  /** @inheritDoc */
  get actor() {
    return this.commander?.actor;
  }

  /**
   * The commander of this group.
   * @returns {TeriockCombatant|null}
   */
  get commander() {
    const commander = this.combat?.combatants.get(this.commanderId);
    if (commander?.groupDocument === this.parent) { return commander; }
    return null;
  }

  /**
   * The minions of this combatant group.
   *
   * Relevant wiki pages:
   * - [Minions](https://wiki.teriock.com/index.php?title=Core:Minions)
   *
   * @returns {TeriockCombatant[]}
   */
  get minions() {
    return this.parent.members.filter(m => m !== this.commander);
  }

  /** @inheritDoc */
  _onUpdate(changed, options, userId) {
    super._onUpdate(changed, options, userId);
    this.combat?.setupTurns();
    if (this.combat?.isViewer) { ui.combat.render(); }
  }

  /** @inheritdoc */
  async _preUpdate(changed, options, userId) {
    const yes = await super._preUpdate(changed, options, userId);
    if (yes === false) { return false; }

    if ("commanderId" in changed && this.commander) { this.updateSource({ initiative: this.commander.initiative }); }
  }

  /** @inheritDoc */
  prepareDerivedData() {
    super.prepareDerivedData();
    if (this.commander?.groupDocument === this.parent) { this.initiative = this.commander.initiative; }
  }
}

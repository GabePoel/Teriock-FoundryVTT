import { EmbeddableDataMixin, PanelDataMixin } from "../../data/mixins/_module.mjs";
import { mixClasses } from "../../utils/_module.mjs";
import { BaseDocumentMixin } from "../mixins/_module.mjs";

const { CombatantGroup } = foundry.documents;

/**
 * The Teriock CombatantGroup implementation.
 * @extends {CombatantGroup}
 * @mixes BaseDocument
 * @mixes PanelData
 * @category Groups
 */
export default class TeriockCombatantGroup
  extends mixClasses(CombatantGroup, BaseDocumentMixin, EmbeddableDataMixin, PanelDataMixin)
{
  /** @inheritDoc */
  get permission() {
    if (game.user.isGM) { return CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER; }
    return this.getUserLevel(game.user);
  }

  /** @inheritDoc */
  getUserLevel(user) {
    user ||= game.user;
    const commander = this.type === "commanded" && this.system.commander;
    const members = commander ? [commander] : [...(this.members ?? [])];
    return Math.max(super.getUserLevel(user), ...members.map(m => m.getUserLevel(user)));
  }
}

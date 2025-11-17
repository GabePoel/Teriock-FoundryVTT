import { dotJoin } from "../../helpers/string.mjs";
import { EmbedCardDocumentMixin } from "../mixins/_module.mjs";

const { Combatant } = foundry.documents;

/**
 * The Teriock {@link Combatant} implementation.
 * @extends {ClientDocument}
 * @extends {Combatant}
 * @mixes EmbedCardDocument
 */
export default class TeriockCombatant extends EmbedCardDocumentMixin(
  Combatant,
) {
  /** @inheritDoc */
  get embedParts() {
    const parts = super.embedParts;
    parts.text = dotJoin([
      this.isDefeated ? "Defeated" : "",
      this.hidden ? "Hidden" : "",
      parts.text,
    ]);
    parts.inactive = this.isDefeated;
    parts.struck = this.isDefeated;
    return parts;
  }
}

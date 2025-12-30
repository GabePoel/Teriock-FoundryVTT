import { dotJoin } from "../../helpers/string.mjs";
import {
  BaseDocumentMixin,
  EmbedCardDocumentMixin,
} from "../mixins/_module.mjs";

const { Combatant } = foundry.documents;

/**
 * The Teriock {@link Combatant} implementation.
 * @extends {ClientDocument}
 * @extends {Combatant}
 * @mixes BaseDocument
 * @mixes EmbedCardDocument
 */
export default class TeriockCombatant extends EmbedCardDocumentMixin(
  BaseDocumentMixin(Combatant),
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

  /**
   * Modified to allow for custom initiative and advantage/disadvantage on alt and shift clicks.
   * @see {TeriockCombatTracker._onCombatantControl}
   * @see {ActorCombatPartInterface.initiative}
   * @inheritDoc
   * @returns {string}
   */
  _getInitiativeFormula() {
    let formula =
      this.actor?.system.initiative || super._getInitiativeFormula();
    if (this._advantage) {
      formula = formula.replace("1d20", "2d20kh1");
    } else if (this._disadvantage) {
      formula = formula.replace("1d20", "2d20kl1");
    }
    delete this._advantage;
    delete this._disadvantage;
    return formula;
  }
}

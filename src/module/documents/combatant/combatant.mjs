import { dotJoin } from "../../helpers/string.mjs";
import {
  BaseDocumentMixin,
  EmbedCardDocumentMixin,
} from "../mixins/_module.mjs";

const { Combatant } = foundry.documents;

//noinspection JSClosureCompilerSyntax
/**
 * The Teriock Combatant implementation.
 * @implements {Teriock.Documents.CombatantInterface}
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
      this.isDefeated
        ? game.i18n.localize("TERIOCK.SYSTEMS.Combatant.EMBED.defeated")
        : "",
      this.hidden
        ? game.i18n.localize("TERIOCK.SYSTEMS.Combatant.EMBED.hidden")
        : "",
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
    let formula = super._getInitiativeFormula();
    if (this.actor) formula = this.actor.system.initiative || formula;
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

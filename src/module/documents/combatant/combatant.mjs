import { BlankMixin } from "../mixins/_module.mjs";

const { Combatant } = foundry.documents;

/**
 * The Teriock {@link Combatant} implementation.
 * @extends {Combatant}
 * @mixes ClientDocumentMixin
 */
export default class TeriockCombatant extends BlankMixin(Combatant) {}

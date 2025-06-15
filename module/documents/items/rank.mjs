import TeriockBaseItem from "./base.mjs";
import TeriockRoll from "../roll.mjs";
import TeriockWikiMixin from "../mixins/wiki-mixin.mjs";

export default class TeriockRank extends TeriockWikiMixin(TeriockBaseItem) {
  
  /** @override */
  getWikiPage() {
    return `Class:${CONFIG.TERIOCK.rankOptions[this.system.archetype].classes[this.system.className].name}`;
  }

  async rollResourceDie(type) {
    const dieKey = type === 'hit' ? 'hitDie' : 'manaDie';
    const spentKey = type === 'hit' ? 'hitDieSpent' : 'manaDieSpent';
    const resourceKey = type === 'hit' ? 'hp' : 'mp';
    if (this.system[spentKey]) return;

    const die = this.system[dieKey];
    const roll = new TeriockRoll(die);
    await roll.evaluate({ async: true });
    await roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      flavor: `${type === 'hit' ? 'Hit' : 'Mana'} Die`,
      type: CONST.CHAT_MESSAGE_TYPES.ROLL,
      rollMode: game.settings.get("core", "rollMode"),
      create: true,
    });
    await this.update({ [`system.${spentKey}`]: true });
    await this.actor.update({
      [`system.${resourceKey}.value`]: Math.min(
        this.actor.system[resourceKey].max,
        this.actor.system[resourceKey].value + roll.total
      ),
    });
  }

  async rollHitDie() {
    return this.rollResourceDie('hit');
  }

  async rollManaDie() {
    return this.rollResourceDie('mana');
  }
}
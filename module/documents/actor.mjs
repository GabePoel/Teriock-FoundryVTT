import prepareDerivedData from "../logic/actor/derived-data.mjs";
import getRollData from "../logic/actor/roll-data.mjs";

/**
 * @extends {Actor}
 */
export class TeriockActor extends Actor {
  /** @override */
  prepareData() {
    super.prepareData();
  }

  /** @override */
  prepareDerivedData() {
    prepareDerivedData(this);
  }

  getRollData() {
    return getRollData(this);
  }

  takeDamage(damage) {
    const { hp } = this.system;
    const temp = Math.max(0, hp.temp - damage);
    damage = Math.max(0, damage - hp.temp);
    const value = Math.max(hp.min, hp.value - damage);

    this.update({ 'system.hp.value': value, 'system.hp.temp': temp });
  }

  takeDrain(drain) {
    const { mp } = this.system;
    const temp = Math.max(0, mp.temp - drain);
    drain = Math.max(0, drain - mp.temp);
    const value = Math.max(mp.min, mp.value - drain);

    this.update({ 'system.mp.value': value, 'system.mp.temp': temp });
  }

  takeWither(wither) {
    this.update({ 'system.wither.value': Math.min(Math.max(0, this.system.wither.value + wither), 100) });
  }

  rollTradecraft(tradecraft, options) {
    const data = this.system.tradecrafts[tradecraft];
    let formula = '1d20';
    if (options?.advantage) {
      formula += 'kh1';
    } else if (options?.disadvantage) {
      formula += 'kl1';
    }
    if (data.proficient) formula += ' + @p';
    if (data.extra) formula += ` + @${tradecraft}`;

    new Roll(formula, this.getRollData()).evaluate({ async: true }).then(result => {
      result.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this }),
        flavor: `${tradecraft[0].toUpperCase() + tradecraft.slice(1)} Check`,
        type: CONST.CHAT_MESSAGE_TYPES.ROLL,
        rollMode: game.settings.get("core", "rollMode"),
        create: true
      });
    });
  }

  rollFeatSave(attribute, options) {
    const bonus = this.system[`${attribute}Save`] || 0;
    let formula = '1d20';
    if (options?.advantage) {
      formula = '2d20kh1';
    } else if (options?.disadvantage) {
      formula = '2d20kl1';
    }
    formula += ` + ${bonus}`
    new Roll(formula).evaluate({ async: true }).then(result => {
      result.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this }),
        flavor: `${attribute.toUpperCase()} Feat Save`,
        type: CONST.CHAT_MESSAGE_TYPES.ROLL,
        rollMode: game.settings.get("core", "rollMode"),
        create: true
      });
    });
  }

  _renderDieBox(rank, type, dieProp, spent) {
    const iconClass = spent ? "fa-light" : "fa-solid";
    const rollClass = spent ? "rolled" : "unrolled";
    const action = spent ? "" : `data-action='roll${type === 'hit' ? "Hit" : "Mana"}Die'`;
    return `<div class="die-box ${rollClass}" data-die="${type}" data-id='${rank._id}' ${action}>
      <i class="fa-fw ${iconClass} fa-dice-${rank.system[dieProp]}"></i></div>`;
  }
}

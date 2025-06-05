import TeriockRoll from "../documents/roll.mjs";
import prepareDerivedData from "../logic/actor/derived-data.mjs";
import postUpdate from "../logic/actor/post-update.mjs";
import getRollData from "../logic/actor/roll-data.mjs";
import rollCondition from "../logic/rollers/instances/condition.mjs";

/**
 * @extends {Actor}
 */
export default class TeriockActor extends Actor {
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

  heal(healing) {
    const { hp } = this.system;
    const value = Math.min(hp.max, hp.value + healing);
    this.update({ 'system.hp.value': value });
  }

  revitalize(revitalizing) {
    const { mp } = this.system;
    const value = Math.min(mp.max, mp.value + revitalizing);
    this.update({ 'system.mp.value': value });
  }

  async hack(part) {
    const stat = this.system.hacks[part];
    const min = stat.min || 0;
    const max = stat.max || 2;
    const value = Math.min(max, Math.max(min, stat.value + 1));
    await this.update({ [`system.hacks.${part}.value`]: value });
    const hacksTotal = Object.values(this.system.hacks).reduce((sum, hack) => sum + (hack.value || 0), 0);
    if (hacksTotal > 0) {
      await this.toggleStatusEffect('hacked', { active: true });
      if (part === 'ear') {
        await this.toggleStatusEffect('deaf', { active: true });
      } else if (part === 'eye') {
        await this.toggleStatusEffect('blind', { active: true });
      } else if (part === 'nose') {
        await this.toggleStatusEffect('anosmatic', { active: true });
      } else if (part === 'mouth') {
        await this.toggleStatusEffect('mute', { active: true });
      } else if (part === 'body') {
        await this.toggleStatusEffect('immobilized', { active: true });
      } else if (part === 'leg') {
        if (value >= 1) {
          await this.toggleStatusEffect('slowed', { active: true });
        }
        if (value >= 2) {
          await this.toggleStatusEffect('immobilized', { active: true });
        }
      }
    }
  }

  async healHack(part) {
    const stat = this.system.hacks[part];
    const min = stat.min || 0;
    const max = stat.max || 2;
    const value = Math.min(max, Math.max(min, stat.value - 1));
    await this.update({ [`system.hacks.${part}.value`]: value });
    const hacksTotal = Object.values(this.system.hacks).reduce((sum, hack) => sum + (hack.value || 0), 0);
    if (hacksTotal === 0) {
      await this.toggleStatusEffect('hacked', { active: false });
    }
  }

  async postUpdate() {
    await postUpdate(this);
  }

  rollCondition(condition, options) {
    rollCondition(this, condition, options);
  }

  rollTradecraft(tradecraft, options = {}) {
    const { proficient, extra } = this.system.tradecrafts[tradecraft] || {};
    let formula = options.advantage ? '2d20kh1' : options.disadvantage ? '2d20kl1' : '1d20';
    if (proficient) formula += ' + @p';
    if (extra) formula += ` + @${tradecraft}`;
    new Roll(formula, this.getRollData()).evaluate({ async: true }).then(result => {
      result.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this }),
        flavor: `${tradecraft.charAt(0).toUpperCase() + tradecraft.slice(1)} Check`,
        type: CONST.CHAT_MESSAGE_TYPES.ROLL,
        rollMode: game.settings.get("core", "rollMode"),
        create: true
      });
    });
  }

  rollFeatSave(attribute, options = {}) {
    const bonus = this.system[`${attribute}Save`] || 0;
    const adv = options.advantage ? "kh1" : options.disadvantage ? "kl1" : "";
    const formula = `2d20${adv || ""}`.replace(/^2d20$/, "1d20") + ` + ${bonus}`;
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

  useAbility(abilityName, options = {}) {
    const abilities = Array.from(this.allApplicableEffects()).filter(i => i.type === 'ability');
    const ability = abilities.find(i => i.name === abilityName);
    if (ability) {
      ability.roll(options);
    } else {
      ui.notifications.warn(`${this.name} does not have ${abilityName}.`);
    }
    return;
  }

  resist(options = {}) {
    let rollFormula = "1d20";
    if (options.advantage) {
      rollFormula = "2d20kh1";
    } else if (options.disadvantage) {
      rollFormula = "2d20kl1";
    }
    rollFormula += ' + @p';
    const rollData = this.getRollData();
    const roll = new TeriockRoll(rollFormula, rollData, {
      context: {
        isResistance: true,
        diceClass: 'resist',
        threshold: 10,
      }
    });
    roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      flavor: "Resistance Save",
      type: CONST.CHAT_MESSAGE_TYPES.ROLL,
      rollMode: game.settings.get("core", "rollMode"),
    });
  }

  endCondition(options = {}) {
    let rollFormula = "2d4";
    if (options.advantage) {
      rollFormula = "3d4";
    } else if (options.disadvantage) {
      rollFormula = "1d4";
    }
    rollFormula += 'kh1';
    const rollData = this.getRollData();
    const roll = new TeriockRoll(rollFormula, rollData, {
      context: {
        diceClass: 'condition',
        threshold: 4,
      }
    });
    roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      flavor: "Condition Ending Roll",
      type: CONST.CHAT_MESSAGE_TYPES.ROLL,
      rollMode: game.settings.get("core", "rollMode"),
    });
  }

  _renderDieBox(rank, type, dieProp, spent) {
    const iconClass = spent ? "fa-light" : "fa-solid";
    const rollClass = spent ? "rolled" : "unrolled";
    const action = spent ? "" : `data-action='roll${type === 'hit' ? "Hit" : "Mana"}Die'`;
    return `<div class="thover die-box ${rollClass}" data-die="${type}" data-id='${rank._id}' ${action} data-tooltip="${type === 'hit' ? "Hit" : "Mana"} Die">
      <i class="fa-fw ${iconClass} fa-dice-${rank.system[dieProp]}"></i></div>`;
  }
}

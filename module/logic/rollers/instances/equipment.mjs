import TeriockHarmRoll from "../../../documents/harm.mjs";

export async function rollEquipment(equipment, options) {
  await use(equipment, options);
}

async function use(equipment, options) {
  let message = await equipment.buildMessage();
  if (equipment.system.damage) {
    let rollFormula = equipment.system.damage || '';
    rollFormula = rollFormula.trim();

    // let damageTypes = equipment.system.damageTypes || [];
    let damageTypes = [];
    if (equipment.system.powerLevel === 'magic') {
      damageTypes.push('Magic');
    }
    const effectDamageTypes = equipment.effects.filter((effect) => {
      return effect.type === 'property' && !effect.disabled && effect.system.damageType;
    }).map((effect) => effect.system.damageType);
    if (equipment.effects.some(effect => effect.type === 'property' && !effect.disabled && (effect.name === 'Flaming' || effect.name === 'Burning'))) {
      effectDamageTypes.push('Fire');
    }
    damageTypes = [...new Set([...damageTypes, ...effectDamageTypes])];
    if (damageTypes.length > 0 && rollFormula.length > 0 && rollFormula !== '0') {
      damageTypes.sort((a, b) => a.localeCompare(b));
      rollFormula += '[' + damageTypes.join(', ') + ']';
    }

    if (options?.twoHanded && equipment.system.twoHandedDamage) {
      rollFormula = equipment.system.twoHandedDamage || rollFormula;
    }
    if (options?.bonusDamage) {
      rollFormula = rollFormula + ' + ' + options.bonusDamage;
    }
    if (equipment.getActor()?.system?.damage?.standard) {
      rollFormula += equipment.getActor().system.damage.standard;
    }
    // if (options?.advantage) {
    //   rollFormula = rollFormula.replace(/(\d*)d(\d+)/gi, (match, dice, sides) => {
    //     const numDice = parseInt(dice) || 1;
    //     return (numDice * 2) + 'd' + sides;
    //   });
    // }
    if (options?.secret) {
      message = await equipment.buildMessage({ secret: true });
    } else {
      message = await equipment.buildMessage({ secret: false });
    }
    const rollData = equipment.getActor()?.getRollData() || {};
    let roll = new TeriockHarmRoll(rollFormula, rollData, { message: message });
    if (options?.advantage) {
      roll = roll.alter(2, 0);
    }
    roll.toMessage({
      speaker: ChatMessage.getSpeaker({
        actor: equipment.getActor(),
      }),
    });
    console.log(roll.terms);
  } else {
    equipment.chat();
  }
}
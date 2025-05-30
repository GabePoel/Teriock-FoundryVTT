import { TeriockHarmRoll } from "../../dice/harm.mjs";

export async function rollEquipment(equipment, options) {
  await use(equipment, options);
}

async function use(equipment, options) {
  console.log(options);
  let message = await equipment.buildMessage();
  if (equipment.system.damage) {
    let rollFormula = equipment.system.damage;
    
    if (options?.twoHanded && equipment.system.twoHandedDamage) {
      rollFormula = equipment.system.twoHandedDamage || rollFormula;
    }
    if (options?.bonusDamage) {
      rollFormula = rollFormula + ' + ' + options.bonusDamage;
    }
    if (options?.advantage) {
      rollFormula = rollFormula.replace(/(\d*)d(\d+)/gi, (match, dice, sides) => {
        const numDice = parseInt(dice) || 1;
        return (numDice * 2) + 'd' + sides;
      });
    }
    if (options?.secret) {
      message = await equipment.buildMessage({ secret: true });
    } else {
      message = await equipment.buildMessage({ secret: false });
    }
    const roll = new TeriockHarmRoll(rollFormula, equipment.getActor()?.getRollData(), { flavor: message });
    roll.toMessage({
      speaker: ChatMessage.getSpeaker({
        actor: equipment.getActor(),
      }),
    });
  } else {
    equipment.chat();
  }
}
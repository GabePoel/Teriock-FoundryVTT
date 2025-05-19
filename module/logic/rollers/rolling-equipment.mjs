import { TeriockRoll } from "../../dice/roll.mjs";

export async function rollEquipment(equipment, options) {
    await use(equipment, options);
}

async function use(equipment, options) {
    let message = await equipment.buildMessage();
    if (equipment.system.damage) {
        let rollFormula = equipment.system.damage;
        if (options?.advantage) {
            rollFormula = rollFormula.replace(/(\d*)d(\d+)/gi, (match, dice, sides) => {
                const numDice = parseInt(dice) || 1;
                return (numDice * 2) + 'd' + sides;
            });
        }
        message = await foundry.applications.ux.TextEditor.enrichHTML(message);
        const roll = new TeriockRoll(rollFormula, equipment.getActor()?.getRollData(), { flavor: message });
        roll.toMessage({
            speaker: ChatMessage.getSpeaker({
                actor: equipment.getActor(),
            }),
        });
    } else {
        equipment.chat();
    }
}
import { TeriockRoll } from "../../dice/roll.mjs";

export async function rollEquipment(equipment, options) {
    await use(equipment);
}

async function use(equipment) {
    let message = await equipment.buildMessage();
    if (equipment.system.damage) {
        const rollFormula = equipment.system.damage;
        message = await foundry.applications.ux.TextEditor.enrichHTML(message);
        const roll = new TeriockRoll(rollFormula, {}, { flavor: message });
        roll.toMessage({
            speaker: ChatMessage.getSpeaker({
                actor: equipment.getActor(),
            }),
        });
    } else {
        equipment.chat();
    }
}
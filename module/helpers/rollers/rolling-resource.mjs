import { TeriockRoll } from "../../dice/roll.mjs";

export async function rollResource(resource, options) {
    await use(resource);
}

async function use(resource) {
    let message = await resource.buildMessage();
    if (resource.system.rollFormula) {
        const rollFormula = resource.system.rollFormula;
        message = await foundry.applications.ux.TextEditor.enrichHTML(message);
        const roll = new TeriockRoll(rollFormula, resource.getActor()?.rollData(), { flavor: message });
        roll.toMessage({
            speaker: ChatMessage.getSpeaker({
                actor: resource.getActor(),
            }),
        });
    } else {
        resource.chat();
    }
}
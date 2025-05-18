import { TeriockRoll } from "../../dice/roll.mjs";

export async function rollResource(resource, options) {
    await use(resource, options);
}

async function use(resource, options) {
    let message = await resource.buildMessage();
    if (resource.system.rollFormula) {
        let rollFormula = resource.system.rollFormula;

        // If options.advantage, double the dice rolled
        if (options?.advantage) {
            // Replace dice expressions like '1d6' with '2d6'
            rollFormula = rollFormula.replace(/(\d*)d(\d+)/gi, (match, dice, sides) => {
                const num = parseInt(dice) || 1;
                return (num * 2) + 'd' + sides;
            });
        }

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
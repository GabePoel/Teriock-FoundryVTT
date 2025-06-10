import TeriockRoll from "../../../documents/roll.mjs";

export async function rollResource(resource, options) {
  await use(resource, options);
}

async function use(resource, options) {
  let message = await resource.buildMessage();
  if (resource.system.rollFormula) {
    let rollFormula = resource.system.rollFormula;

    if (options?.advantage) {
      rollFormula = rollFormula.replace(/(\d*)d(\d+)/gi, (match, dice, sides) => {
        const num = parseInt(dice) || 1;
        return (num * 2) + 'd' + sides;
      });
    }

    message = await foundry.applications.ux.TextEditor.enrichHTML(message);
    const roll = new TeriockRoll(rollFormula, resource.getActor()?.getRollData(), { message: message });
    await roll.toMessage({
      speaker: ChatMessage.getSpeaker({
        actor: resource.getActor(),
      }),
    });
    const result = roll.total;
    console.log(`Rolled ${resource.name} with result: ${result}`);
    const functionHook = resource.system.functionHook;
    if (functionHook) {
      const hookFunction = CONFIG.TERIOCK.resourceOptions.functionHooks[functionHook]?.callback;
      await hookFunction?.(resource, result);
    }
  } else {
    resource.chat();
  }
}
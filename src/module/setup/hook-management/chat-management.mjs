import {
  commands,
  interpretArguments,
  parseArguments,
} from "../../helpers/interaction/_module.mjs";

export default function registerChatManagementHooks() {
  foundry.helpers.Hooks.on("chatMessage", (_chatLog, message) => {
    for (const [id, interaction] of Object.entries(commands)) {
      if (message.startsWith(`/${id} `) || message === `/${id}`) {
        const argString = message.slice(id.length + 1).trim();
        const argArr = parseArguments(argString);
        const argObj = interpretArguments(argArr, interaction);
        const actors = game.canvas.tokens.controlled
          .map((t) => t?.actor)
          .filter((a) => a);
        actors.map((actor) => interaction.primary(actor, argObj));
      }
    }
    return false;
  });
}

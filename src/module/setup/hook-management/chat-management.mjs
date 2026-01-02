import {
  commands,
  interpretArguments,
  parseArguments,
} from "../../helpers/interaction/_module.mjs";

export default function registerChatManagementHooks() {
  foundry.helpers.Hooks.on("chatMessage", (_chatLog, message) => {
    let hasCommand = false;
    for (const [id, command] of Object.entries(commands)) {
      if (message.startsWith(`/${id} `) || message === `/${id}`) {
        hasCommand = true;
        const argumentString = message.slice(id.length + 1).trim();
        let argumentArray;
        if (command.formula) {
          argumentArray = [["formula", argumentString]];
        } else {
          argumentArray = parseArguments(argumentString);
        }
        const argObj = interpretArguments(argumentArray, command);
        const actors = game.canvas.tokens.controlled
          .map((t) => t?.actor)
          .filter((a) => a);
        actors.map((actor) => command.primary(actor, argObj));
      }
    }
    if (hasCommand) {
      return false;
    }
  });
}

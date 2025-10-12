import { commandHandlers } from "../../helpers/interaction/_module.mjs";

export default function registerChatManagementHooks() {
  foundry.helpers.Hooks.on("chatMessage", (_chatLog, message) => {
    const commands = Object.keys(commandHandlers);
    for (const command of commands) {
      if (message.startsWith(`/${command}`)) {
        const handler = new commandHandlers[command](
          message.slice(command.length + 1).trim(),
        );
        //noinspection JSIgnoredPromiseFromCall
        handler.execute();
        return false;
      }
    }
  });
}

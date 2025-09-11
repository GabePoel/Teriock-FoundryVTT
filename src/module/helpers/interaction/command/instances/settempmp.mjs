import TeriockCommand from "../command.mjs";

export const settempmp = new TeriockCommand(
  "settempmp",
  "Set temporary MP on targeted tokens. Usage: /settempmp <amount>",
  async ({
    args,
    _chatData,
    actors,
  }) => {
    if (args.length === 0) {
      ui.notifications.warn("Usage: /settempmp <amount>");
      return;
    }

    const amount = parseInt(args[0]);
    if (isNaN(amount) || amount < 0) {
      ui.notifications.warn("Amount must be a non-negative number.");
      return;
    }

    for (const actor of actors) {
      await actor.takeSetTempMp(amount);
    }

    ui.notifications.info(`Set ${amount} temporary MP on ${actors.length} target(s).`);
  },
  {
    aliases: [ "stmp" ],
    category: "#support",
    requiresTarget: true,
  },
);

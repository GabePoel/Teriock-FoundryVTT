import TeriockCommand from "../command.mjs";

export const gaintempmp = new TeriockCommand(
  "gaintempmp",
  "Gain temporary MP on targeted tokens. Usage: /gaintempmp <amount>",
  async ({ args, chatData, actors }) => {
    if (args.length === 0) {
      ui.notifications.warn("Usage: /gaintempmp <amount>");
      return;
    }

    const amount = parseInt(args[0]);
    if (isNaN(amount) || amount < 0) {
      ui.notifications.warn("Amount must be a non-negative number.");
      return;
    }

    for (const actor of actors) {
      await actor.takeGainTempMp(amount);
    }

    ui.notifications.info(
      `Gained ${amount} temporary MP on ${actors.length} target(s).`,
    );
  },
  {
    aliases: ["gtmp"],
    category: "#support",
    requiresTarget: true,
  },
);

import TeriockCommand from "../command.mjs";

export const gaintemphp = new TeriockCommand(
  "gaintemphp",
  "Gain temporary HP on targeted tokens. Usage: /gaintemphp <amount>",
  async ({ args, _chatData, actors }) => {
    if (args.length === 0) {
      foundry.ui.notifications.warn("Usage: /gaintemphp <amount>");
      return;
    }

    const amount = parseInt(args[0]);
    if (isNaN(amount) || amount < 0) {
      foundry.ui.notifications.warn("Amount must be a non-negative number.");
      return;
    }

    for (const actor of actors) {
      await actor.system.takeGainTempHp(amount);
    }

    foundry.ui.notifications.info(
      `Gained ${amount} temporary HP on ${actors.length} target(s).`,
    );
  },
  {
    aliases: ["gthp"],
    category: "#support",
    requiresTarget: true,
  },
);

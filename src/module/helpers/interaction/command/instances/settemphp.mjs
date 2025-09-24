import TeriockCommand from "../command.mjs";

export const settemphp = new TeriockCommand(
  "settemphp",
  "Set temporary HP on targeted tokens. Usage: /settemphp <amount>",
  async ({ args, _chatData, actors }) => {
    if (args.length === 0) {
      foundry.ui.notifications.warn("Usage: /settemphp <amount>");
      return;
    }

    const amount = parseInt(args[0]);
    if (isNaN(amount) || amount < 0) {
      foundry.ui.notifications.warn("Amount must be a non-negative number.");
      return;
    }

    for (const actor of actors) {
      await actor.takeSetTempHp(amount);
    }

    foundry.ui.notifications.info(
      `Set ${amount} temporary HP on ${actors.length} target(s).`,
    );
  },
  {
    aliases: ["sthp"],
    category: "#support",
    requiresTarget: true,
  },
);

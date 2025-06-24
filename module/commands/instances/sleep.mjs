import TeriockCommand from "../command.mjs";

export const sleep = new TeriockCommand(
  "sleep",
  "Apply sleep status to targeted tokens if their HP is low enough. Usage: /sleep <damage_amount>",
  async ({ args, chatData, actors }) => {
    if (args.length === 0) {
      ui.notifications.warn("Usage: /sleep <damage_amount>");
      return;
    }

    const damageAmount = parseInt(args[0]);
    if (isNaN(damageAmount) || damageAmount < 0) {
      ui.notifications.warn("Damage amount must be a non-negative number.");
      return;
    }

    for (const actor of actors) {
      await actor.takeSleep(damageAmount);
    }

    ui.notifications.info(`Applied sleep check with ${damageAmount} damage to ${actors.length} target(s).`);
  },
  {
    category: "damage",
    requiresTarget: true,
  },
);

import TeriockCommand from "../command.mjs";

export const kill = new TeriockCommand(
  "kill",
  "Apply death status to targeted tokens if their HP is low enough. Usage: /kill <damage_amount>",
  async ({
    args,
    _chatData,
    actors,
  }) => {
    if (args.length === 0) {
      ui.notifications.warn("Usage: /kill <damage_amount>");
      return;
    }

    const damageAmount = parseInt(args[0]);
    if (isNaN(damageAmount) || damageAmount < 0) {
      ui.notifications.warn("Damage amount must be a non-negative number.");
      return;
    }

    for (const actor of actors) {
      await actor.takeKill(damageAmount);
    }

    ui.notifications.info(`Applied kill check with ${damageAmount} damage to ${actors.length} target(s).`);
  },
  {
    category: "#damage",
    requiresTarget: true,
  },
);

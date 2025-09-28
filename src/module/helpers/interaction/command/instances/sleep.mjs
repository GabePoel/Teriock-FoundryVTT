import TeriockCommand from "../command.mjs";

export const sleep = new TeriockCommand(
  "sleep",
  "Apply sleep status to targeted tokens if their HP is low enough. Usage: /sleep <hp_threshold>",
  async ({ args, _chatData, actors }) => {
    if (args.length === 0) {
      foundry.ui.notifications.warn("Usage: /sleep <hp_threshold>");
      return;
    }

    const damageAmount = parseInt(args[0]);
    if (isNaN(damageAmount) || damageAmount < 0) {
      foundry.ui.notifications.warn(
        "Damage amount must be a non-negative number.",
      );
      return;
    }

    for (const actor of actors) {
      await actor.system.takeSleep(damageAmount);
    }

    foundry.ui.notifications.info(
      `Applied sleep check with ${damageAmount} damage to ${actors.length} target(s).`,
    );
  },
  {
    category: "#damage",
    requiresTarget: true,
  },
);

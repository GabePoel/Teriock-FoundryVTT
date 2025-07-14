import TeriockCommand from "../command.mjs";

export const use = new TeriockCommand(
  "use",
  "Use a named ability. Syntax: /use [ability name] [advantage|disadvantage]",
  async ({ args, options, actors }) => {
    const abilityName = args.join(" ").trim();
    if (!abilityName) {
      ui.notifications.warn("Please specify an ability to use.");
      return;
    }

    for (const actor of actors) {
      await actor.useAbility(abilityName, {
        advantage: options.advantage,
        disadvantage: options.disadvantage,
      });
    }
  },
  {
    category: "#utility",
    requiresTarget: true,
  },
);

import TeriockCommand from "../command.mjs";

export const resist = new TeriockCommand(
  "resist",
  "Make all targeted actorsUuids roll to resist. Supports [advantage, disadvantage].",
  async ({ options, actors }) => {
    for (const actor of actors) {
      await actor.system.rollResistance({
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

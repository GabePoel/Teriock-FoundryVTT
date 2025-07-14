import TeriockCommand from "../command.mjs";

export const resist = new TeriockCommand(
  "resist",
  "Make all targeted actors roll to resist. Supports [advantage, disadvantage].",
  async ({ options, actors }) => {
    for (const actor of actors) {
      await actor.rollResistance({
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

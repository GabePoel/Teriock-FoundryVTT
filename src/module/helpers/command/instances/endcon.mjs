import TeriockCommand from "../command.mjs";

export const endcon = new TeriockCommand(
  "endcon",
  "Make all targeted actors roll to end conditions. Supports [advantage, disadvantage].",
  async ({ options, actors }) => {
    for (const actor of actors) {
      await actor.endCondition({
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

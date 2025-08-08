import TeriockCommand from "../command.mjs";

export const attack = new TeriockCommand(
  "attack",
  "Use Basic Attack for all targeted actorsUuids. Supports [advantage, disadvantage].",
  async ({ options, actors }) => {
    for (const actor of actors) {
      await actor.useAbility("Basic Attack", {
        advantage: options.advantage,
        disadvantage: options.disadvantage,
      });
    }
  },
  {
    category: "#combat",
    requiresTarget: true,
  },
);

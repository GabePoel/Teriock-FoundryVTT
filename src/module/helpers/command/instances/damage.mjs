import TeriockRoll from "../../../documents/roll.mjs";
import TeriockCommand from "../command.mjs";

export const damage = new TeriockCommand(
  "damage",
  "Roll damage and apply it to targeted tokens.",
  async ({ args, options, chatData, actors }) => {
    const formula = args.join(" ");
    const roll = new TeriockRoll(formula, {
      speaker: chatData.speaker,
      advantage: options.advantage,
      disadvantage: options.disadvantage,
    });

    await roll.toMessage({
      user: chatData.user,
      speaker: chatData.speaker,
      flavor: "Damage Roll",
    });

    for (const actor of actors) {
      await actor.takeDamage(roll.total);
    }
  },
  {
    category: "#combat",
    requiresTarget: true,
  },
);

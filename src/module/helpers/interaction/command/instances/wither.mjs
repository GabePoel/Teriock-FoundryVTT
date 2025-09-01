import TeriockRoll from "../../../../documents/roll.mjs";
import TeriockCommand from "../command.mjs";

export const wither = new TeriockCommand(
  "wither",
  "Roll wither and apply it to targeted tokens.",
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
      flavor: "Wither Roll",
    });

    for (const actor of actors) {
      await actor.takeWither(roll.total);
    }
  },
  {
    category: "#combat",
    requiresTarget: true,
  },
);

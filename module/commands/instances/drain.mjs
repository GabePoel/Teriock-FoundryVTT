import TeriockRoll from "../../documents/roll.mjs";
import TeriockCommand from "../command.mjs";

export const drain = new TeriockCommand(
  "drain",
  "Roll drain and apply it to targeted tokens.",
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
      flavor: "Drain Roll",
    });

    for (const actor of actors) {
      await actor.takeDrain(roll.total);
    }
  },
  {
    category: "#combat",
    requiresTarget: true,
  },
);

import TeriockCommand from "../command.mjs";
import TeriockHarmRoll from "../../documents/harm.mjs";

export const harm = new TeriockCommand(
  "harm",
  "Roll harm (damage, drain, or wither) and create buttons for others to apply to their targets.",
  async ({ args, options, chatData }) => {
    const formula = args.join(" ");
    const roll = new TeriockHarmRoll(formula, {
      speaker: chatData.speaker,
      advantage: options.advantage,
      disadvantage: options.disadvantage,
    });

    await roll.toMessage({
      user: chatData.user,
      speaker: chatData.speaker,
      flavor: "Harm Roll",
    });
  },
  {
    category: "combat",
    aliases: [],
    requiresTarget: false,
  },
);

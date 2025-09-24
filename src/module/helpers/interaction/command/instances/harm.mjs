import { harmRoll } from "../../../quick-rolls.mjs";
import TeriockCommand from "../command.mjs";

export const harm = new TeriockCommand(
  "harm",
  "Roll harm (damage, drain, or wither) and create buttons for others to apply to their targets.",
  async ({ args, _options, _chatData }) => {
    const formula = args.join(" ");
    await harmRoll(formula);
  },
  {
    category: "#combat",
    aliases: ["h"],
    requiresTarget: false,
  },
);

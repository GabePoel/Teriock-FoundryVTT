import TeriockRoll from "../../documents/roll.mjs";
import TeriockCommand from "../command.mjs";

export const pay = new TeriockCommand(
  "pay",
  "Roll payment and apply it to targeted tokens. Supports [--exact/-e, --greedy/-g].",
  async ({ args, options, chatData, actors }) => {
    const formula = args[0] ?? "0";
    const roll = new TeriockRoll(formula, {
      speaker: chatData.speaker,
      advantage: options.advantage,
      disadvantage: options.disadvantage,
    });

    /** @type {"greedy" | "exact"} */
    let mode = "greedy";
    if (
      options.rawArgs?.includes("--exact") ||
      options.rawArgs?.includes("-e")
    ) {
      mode = "exact";
    }
    if (
      options.rawArgs?.includes("--greedy") ||
      options.rawArgs?.includes("-g")
    ) {
      mode = "greedy";
    }

    await roll.toMessage({
      user: chatData.user,
      speaker: chatData.speaker,
      flavor: "Payment Roll",
    });

    for (const actor of actors) {
      await actor.takePay(roll.total, mode);
    }
  },
  {
    category: "#support",
    requiresTarget: true,
  },
);

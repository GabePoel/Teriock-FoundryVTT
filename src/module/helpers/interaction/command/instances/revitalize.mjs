import { TeriockRoll } from "../../../../dice/_module.mjs";
import TeriockCommand from "../command.mjs";

export const revitalize = new TeriockCommand(
  "revitalize",
  "Roll revitalization and apply it to targeted tokens.",
  async ({
    args,
    options,
    chatData,
    actors,
  }) => {
    const formula = args.join(" ");
    const roll = new TeriockRoll(formula, {
      speaker: chatData.speaker,
      advantage: options.advantage,
      disadvantage: options.disadvantage,
    });

    await roll.toMessage({
      user: chatData.user,
      speaker: chatData.speaker,
      flavor: "Revitalize Roll",
    });

    for (const actor of actors) {
      await actor.takeRevitalize(roll.total);
    }
  },
  {
    category: "#support",
    requiresTarget: true,
  },
);

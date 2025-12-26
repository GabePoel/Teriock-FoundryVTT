import { tradecrafts } from "../../../constants/index/_module.mjs";
import { thresholdCommand } from "./abstract-command.mjs";

/**
 * @param {TeriockActor} actor
 * @param {Teriock.Interactions.TradecraftOptions} options
 */
async function primary(actor, options = {}) {
  const tradecraft = options.tradecraft || "artist";
  await actor.system.rollTradecraft(tradecraft, options);
}

/**
 * Tradecraft command
 * @type {Teriock.Interactions.CommandEntry}
 */
const command = {
  ...thresholdCommand,
  aliases: ["tc"],
  args: ["tradecraft"],
  icon: (options) => `${tradecrafts[options?.tradecraft || "artist"].icon}`,
  id: "tradecraft",
  label: (options) =>
    `${tradecrafts[options?.tradecraft || "artist"].label} Check`,
  primary,
};

export default command;

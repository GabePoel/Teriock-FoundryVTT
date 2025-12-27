import { tradecraftOptions } from "../../../constants/options/tradecraft-options.mjs";
import { thresholdCommand } from "./abstract-command.mjs";

const allOptions = {};
Object.values(tradecraftOptions).forEach((fieldOption) => {
  Object.assign(allOptions, fieldOption.tradecrafts);
});

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
  icon: (options) => `${allOptions[options?.tradecraft || "artist"].icon}`,
  id: "tradecraft",
  label: (options) =>
    `${allOptions[options?.tradecraft || "artist"].name} Check`,
  primary,
};

export default command;

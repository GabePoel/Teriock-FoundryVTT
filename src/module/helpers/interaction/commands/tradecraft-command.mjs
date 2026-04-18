import { tradecraftConfig } from "../../../constants/config/tradecraft-config.mjs";
import { thresholdCommand } from "./abstract-command.mjs";

const allOptions = {};
Object.values(tradecraftConfig).forEach((fieldOption) => {
  Object.assign(allOptions, fieldOption.tradecrafts);
});

/**
 * @param {TeriockActor} actor
 * @param {Teriock.Interaction.TradecraftOptions} options
 */
async function use(actor, options = {}) {
  const tradecraft = options.tradecraft || "artist";
  await actor.system.rollTradecraft(tradecraft, options);
}

/**
 * Tradecraft command
 * @type {Teriock.Interaction.CommandEntry}
 */
const command = {
  ...thresholdCommand,
  aliases: ["tc"],
  args: ["tradecraft"],
  icon: (options) => `${allOptions[options?.tradecraft || "artist"].icon}`,
  id: "tradecraft",
  label: (options) =>
    allOptions[options?.tradecraft]?.name
      ? _loc("TERIOCK.ROLLS.Tradecraft.name", {
          value: allOptions[options?.tradecraft].name,
        })
      : _loc("TERIOCK.ROLLS.Tradecraft.label"),
  primary: use,
  secondary: use,
};

export default command;

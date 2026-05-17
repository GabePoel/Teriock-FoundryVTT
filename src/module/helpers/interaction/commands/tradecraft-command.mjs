import { tradecraftConfig } from "../../../constants/config/tradecraft-config.mjs";
import { simpleCommandFunctionFactory, thresholdCommand } from "./abstract-command.mjs";

const allOptions = {};
Object.values(tradecraftConfig).forEach(fieldOption => {
  Object.assign(allOptions, fieldOption.tradecrafts);
});

/** @type {Teriock.Interaction.SimpleCommandFunction<Teriock.Interaction.TradecraftOptions>} */
const use = simpleCommandFunctionFactory((a, o) => a.system.rollTradecraft(o.tradecraft ?? "artist", o));

/**
 * Tradecraft command
 * @type {Teriock.Interaction.CommandEntry}
 */
const command = {
  ...thresholdCommand,
  aliases: ["tc"],
  args: ["tradecraft"],
  icon: options => `${allOptions[options?.tradecraft || "artist"].icon}`,
  id: "tradecraft",
  label: options =>
    allOptions[options?.tradecraft]?.name
      ? _loc("TERIOCK.ROLLS.Tradecraft.name", {
          value: allOptions[options?.tradecraft].name,
        })
      : _loc("TERIOCK.ROLLS.Tradecraft.label"),
  primary: use,
  secondary: use,
};

export default command;

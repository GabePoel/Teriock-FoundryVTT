import { simpleCommandFunctionFactory, thresholdCommand } from "./abstract-command.mjs";

/** @type {Teriock.Command.SimpleCommandFunction<Teriock.Command.TradecraftOptions>} */
const use = simpleCommandFunctionFactory((a, o) => a.system.rollTradecraft(o.tradecraft ?? "artist", o));

/**
 * Tradecraft command
 * @type {Teriock.Command.CommandEntry}
 */
const command = {
  ...thresholdCommand,
  aliases: ["tc"],
  args: ["tradecraft"],
  id: "tradecraft",
  primary: use,
  secondary: use,
  icon: options => `${TERIOCK.CONFIG.tradecraft.tradecrafts[options?.tradecraft || "artist"].icon}`,
  label: options => TERIOCK.CONFIG.tradecraft.tradecrafts[options?.tradecraft]?.label
    ? _loc("TERIOCK.ROLLS.Tradecraft.name", { value: TERIOCK.CONFIG.tradecraft.tradecrafts[options?.tradecraft].label })
    : _loc("TERIOCK.ROLLS.Tradecraft.label"),
};

export default command;

import { simpleCommandFunctionFactory } from "./abstract-command.mjs";

/** @type {Teriock.Interaction.SimpleCommandFunction<Teriock.Interaction.HackOptions>} */
const takeHack = simpleCommandFunctionFactory((a, o) =>
  a.system.takeHack(o.part ?? "arm"),
);

/** @type {Teriock.Interaction.SimpleCommandFunction<Teriock.Interaction.HackOptions>} */
const takeUnhack = simpleCommandFunctionFactory((a, o) =>
  a.system.takeUnhack(o.part ?? "arm"),
);

/**
 * Hack command
 * @type {Teriock.Interaction.CommandEntry}
 */
export const hackCommand = {
  args: ["part"],
  icon: (options) => TERIOCK.config.hack[options?.part || "arm"].icon,
  id: "hack",
  label: (options) => TERIOCK.config.hack[options?.part || "arm"].label,
  primary: takeHack,
  secondary: takeUnhack,
};

/**
 * Unhack command
 * @type {Teriock.Interaction.CommandEntry}
 */
export const unhackCommand = {
  args: ["part"],
  icon: (options) => TERIOCK.config.hack[options?.part || "arm"].icon,
  id: "unhack",
  label: (options) => TERIOCK.config.hack[options?.part || "arm"].remove,
  primary: takeUnhack,
  secondary: takeHack,
};

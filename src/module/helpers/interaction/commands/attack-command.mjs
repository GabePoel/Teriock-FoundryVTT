import { simpleCommandFunctionFactory } from "./abstract-command.mjs";

const use = simpleCommandFunctionFactory((a, o) => a.useDocument("basic-attack", { ...o, type: "ability" }));

/**
 * Attack command
 * @type {Teriock.Command.CommandEntry}
 */
const command = {
  id: "attack",
  label: "TERIOCK.COMMANDS.Attack.label",
  primary: use,
  secondary: use,
  icon: () => TERIOCK.config.document.ability.icon,
};

export default command;

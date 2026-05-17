import { simpleCommandFunctionFactory } from "./abstract-command.mjs";

const use = simpleCommandFunctionFactory((a, o) => a.useDocument("basic-attack", { ...o, type: "ability" }));

/**
 * Attack command
 * @type {Teriock.Interaction.CommandEntry}
 */
const command = {
  icon: () => TERIOCK.config.document.ability.icon,
  id: "attack",
  label: "TERIOCK.COMMANDS.Attack.label",
  primary: use,
  secondary: use,
};

export default command;

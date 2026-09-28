import { icons } from "../../../constants/display/_module.mjs";

/**
 * Fall command
 * @type {Teriock.Command.CommandEntry}
 */
const command = {
  args: ["distance"],
  icon: icons.manifest.ui.fall,
  id: "fall",
  label: "TERIOCK.EFFECTS.Common.fall",
  noActor: true,
  primary: (a, { distance, water }) =>
    teriock.executions.activity.FallExecution.create({ distance, water }, { actor: a }),
};

export default command;

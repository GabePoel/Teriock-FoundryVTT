/**
 * Fall command
 * @type {Teriock.Command.CommandEntry}
 */
const command = {
  args: ["distance"],
  icon: TERIOCK.DISPLAY.icons.manifest.execution.fall,
  id: "fall",
  label: "TERIOCK.EFFECTS.Common.fall",
  noActor: true,
  primary: (a, { distance, water }) =>
    teriock.executions.activity.FallExecution.create({ distance, water }, { actor: a }),
};

export default command;

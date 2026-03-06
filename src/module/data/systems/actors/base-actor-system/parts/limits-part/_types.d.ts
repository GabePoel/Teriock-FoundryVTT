import { EvaluationModel } from "../../../../../models/_module.mjs";

export type ActorLimitsPartInterface = {
  /** <schema> <base> How many curses the {@link TeriockActor} has */
  curses: Teriock.Foundry.BarField;
  /** <schema> Magic */
  magic: {
    /** <schema> Maximum number of rotators */
    maxRotators: EvaluationModel;
  };
};

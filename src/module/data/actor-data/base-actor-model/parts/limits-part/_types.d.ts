import { EvaluationModel } from "../../../../models/_module.mjs";

export default interface ActorLimitsPartInterface {
  /** <schema> <base> How many curses the {@link TeriockActor} has */
  curses: {
    /** <base> Minimum number of curses is always zero */
    min: number;
    /** <base> Value is determined by counting each curse {@link TeriockPower} */
    value: number;
    /** <base> Max is three by default */
    max: number;
  };
  /** <schema> Magic */
  magic: {
    /** <schema> Maximum number of rotators */
    maxRotators: EvaluationModel;
  };
}

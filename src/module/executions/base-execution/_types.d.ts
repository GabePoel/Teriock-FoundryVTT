import { TeriockActor } from "../../documents/_module.mjs";

declare global {
  namespace Teriock.Execution {
    export type BaseExecutionOptions = {
      actor?: TeriockActor;
      competence?: Teriock.System.CompetenceLevel;
      event?: PointerEvent;
      formula?: Teriock.System.FormulaString;
      rollData?: object;
      rollOptions?: object;
      showDialog?: boolean;
    };
  }
}

import { TeriockActor } from "../../../documents/_module.mjs";

declare global {
  namespace Teriock.Execution {
    export type BaseExecutionOptions = {
      actor?: TeriockActor;
      boosts?: Record<Teriock.Keys.Impact, Teriock.System.FormulaString>;
      competence?: Teriock.System.CompetenceLevel;
      event?: PointerEvent;
      formula?: Teriock.System.FormulaString;
      messageMode?: Teriock.Messages.Mode;
      rollData?: object;
      rollOptions?: object;
      showDialog?: boolean;
    };
  }
}

import { TeriockActor } from "../../documents/_module.mjs";

declare global {
  namespace Teriock.Execution {
    export type BaseExecutionOptions = {
      actor?: TeriockActor;
      event?: PointerEvent;
      fluent?: boolean;
      formula?: string;
      proficient?: boolean;
      rollData?: object;
      rollOptions?: object;
    };
  }
}

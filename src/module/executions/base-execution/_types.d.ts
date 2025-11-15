import { TeriockActor } from "../../documents/_module.mjs";

declare global {
  namespace Teriock.Execution {
    export type BaseExecutionOptions = {
      actor?: TeriockActor;
      proficient?: boolean;
      fluent?: boolean;
      formula?: string;
      rollData?: object;
      rollOptions?: object;
    };
  }
}

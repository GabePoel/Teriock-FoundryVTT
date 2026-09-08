import { BaseExecution } from "../../../../executions/abstract/_module.mjs";
import { AbilityExecution } from "../../../../executions/child-executions/_module.mjs";

declare global {
  namespace Teriock.Automations {
    export type GetActivationsOptions = {
      /** The execution that is asking for these activations. */
      execution?: AbilityExecution | BaseExecution;
      /** Roll data the automation or activations should have access to. */
      rollData?: object;
    };
  }
}

export {};

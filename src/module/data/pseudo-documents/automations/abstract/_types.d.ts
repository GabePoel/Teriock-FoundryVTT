import { BaseExecution } from "../../../../executions/_module.mjs";
import { BaseEffectSystem } from "../../../systems/effects/_module.mjs";
import { BaseItemSystem } from "../../../systems/items/_module.mjs";

declare global {
  namespace Teriock.Automations {
    export type BaseAutomationData = {
      competencies: Set<number>;
      heighten: Set<number>;

      get parent(): BaseEffectSystem | BaseItemSystem;
    };

    export type GetActivationsOptions = {
      /** The execution that is asking for these activations. */
      execution?: BaseExecution;
      /** Roll data the automation or activations should have access to. */
      rollData?: object;
    };
  }
}

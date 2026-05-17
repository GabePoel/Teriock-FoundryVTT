import { BaseEffectSystem } from "../../../systems/effects/_module.mjs";
import { BaseItemSystem } from "../../../systems/items/_module.mjs";

declare global {
  namespace Teriock.Automations {
    export type BaseAutomationData = {
      competencies: Set<number>;
      heighten: Set<number>;

      get parent(): BaseEffectSystem | BaseItemSystem;
    };
  }
}

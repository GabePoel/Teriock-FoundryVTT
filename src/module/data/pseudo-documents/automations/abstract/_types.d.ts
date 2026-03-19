import { ChildSystem } from "../../../systems/abstract/_module.mjs";

declare global {
  namespace Teriock.Automations {
    export type BaseAutomationData = {
      competencies: Set<number>;
      heighten: Set<number>;

      get parent(): ChildSystem;
    };
  }
}

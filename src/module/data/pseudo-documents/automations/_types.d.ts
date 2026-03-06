import { ChildSystem } from "../../systems/abstract/_module.mjs";

declare global {
  namespace Teriock.Automations {
    export type BaseAutomationInterface = {
      competencies: Set<number>;
      heighten: Set<number>;

      get parent(): ChildSystem;
    };
  }
}

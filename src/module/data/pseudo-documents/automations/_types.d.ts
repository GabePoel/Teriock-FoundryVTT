import { ChildSystem } from "../../systems/abstract/_module.mjs";

declare global {
  namespace Teriock.Models {
    export interface BaseAutomationInterface {
      competencies: Set<number>;
      heighten: Set<number>;

      get parent(): ChildSystem;
    }
  }
}

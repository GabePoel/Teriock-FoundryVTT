import { TeriockToken } from "../../../../canvas/placeables/_module.mjs";
import BaseDocumentExecution from "../../base-document-execution/base-document-execution.mjs";

declare global {
  namespace Teriock.Execution {
    export type AbilityExecutionOptions = DocumentExecutionOptions &
      ThresholdExecutionOptions & {
        armament?: TeriockArmament;
        attackPenalty?: string;
        av0?: boolean;
        noHeighten?: boolean;
        noTemplate?: boolean;
        sb?: boolean;
        ub?: boolean;
        warded?: boolean;
        source?: TeriockAbility;
      };
  }
}

declare module "./ability-execution-constructor.mjs" {
  export default interface AbilityExecutionConstructionPart
    extends BaseDocumentExecution {
    armament: TeriockArmament | null;
    attackPenalty: number;
    attackPenaltyFormula: string;
    costs: {
      hp: number;
      mp: number;
      gp: number;
    };
    executor: TeriockToken | null;
    flags: {
      noTemplate: boolean;
      noHeighten: boolean;
    };
    heightened: number;
    piercing: {
      av0: boolean;
      ub: boolean;
      sb: boolean;
    };
    targets: Set<TeriockToken>;
    warded: boolean;

    get source(): TeriockAbility;
  }
}

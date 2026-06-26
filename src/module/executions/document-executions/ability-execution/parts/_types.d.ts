import { TeriockToken } from "../../../../canvas/placeables/_module.mjs";
import BaseDocumentExecution from "../../base-document-execution/base-document-execution.mjs";

declare global {
  namespace Teriock.Execution {
    export type AbilityExecutionOptions = DocumentExecutionOptions & ThresholdExecutionOptions & {
      armament?: TeriockArmament;
      attackPenalty?: string;
      av0?: boolean;
      limb?: boolean;
      noGp?: boolean;
      noHeighten?: boolean;
      noHp?: boolean;
      noLp?: boolean;
      noMp?: boolean;
      piercing?: Teriock.System.PiercingLevel;
      sb?: boolean;
      source?: TeriockAbility;
      ub?: boolean;
      vitals?: boolean;
      warded?: boolean;
    };
  }
}

declare module "./ability-execution-constructor.mjs" {
  export default interface AbilityExecutionConstructionPart extends BaseDocumentExecution {
    armament: TeriockArmament | null;
    attackPenalty: number;
    attackPenaltyFormula: string;
    costs: { gp: number, hp: number, lp: number, mp: number };
    executor: TeriockToken | null;
    noHeighten: boolean;
    heightened: number;
    targets: Set<TeriockToken>;
    vitals: boolean;
    warded: boolean;
  }
}

export {};

import { TeriockToken } from "../../../canvas/placeables/_module.mjs";
import { BaseModifierModel } from "../../../data/models/modifier-models/_module.mjs";
import CompetenceModel from "../../../data/models/scaling-models/competence-model/competence-model.mjs";
import { ExecutionPseudoCollection } from "../../../data/pseudo-documents/collections/_module.mjs";

declare module "./base-execution.mjs" {
  export default interface BaseExecution {
    competence: CompetenceModel;
    formula: Teriock.System.FormulaString;
    makeCritEffect: boolean;
    makeEffect: boolean;
    targetsActor: boolean;
    targetsArmament: boolean;

    _actor: TeriockActor | null;
    _boosts: Record<Teriock.Keys.Impact, Teriock.System.FormulaString>;
    _messageMode: Teriock.Messages.Mode;
    _rollData: object;
    _rollOptions: object;
    _showDialog: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Foundry's source data is untyped.
    _source: Record<string, any>;
    _sourceDocument: BaseModifierModel | TeriockActiveEffect | TeriockActor | TeriockItem;
    automations: ExecutionPseudoCollection<Automation>;
    executor: TeriockToken | null;
    options: Partial<Teriock.Execution.ExecutionOptions>;
  }
}

export {};

import { TeriockEffect, TeriockTokenDocument } from "../_module.mjs";
import { TeriockBaseActorModel } from "../../data/actor-data/_module.mjs";
import { TeriockBaseActorSheet } from "../../applications/sheets/actor-sheets/_module.mjs";

declare module "./actor.mjs" {
  export default interface TeriockActor
    extends Teriock.Documents.Interface<TeriockChild> {
    appliedEffects: TeriockEffect[];
    readonly itemTypes: Teriock.Parent.ParentItemTypes;
    sheet: TeriockBaseActorSheet;
    statuses: Set<Teriock.Parameters.Condition.ConditionKey>;
    system: TeriockBaseActorModel;
    readonly token: TeriockTokenDocument;

    get documentName(): "Actor";

    getDependentTokens(): TeriockTokenDocument[];

    get temporaryEffects(): TeriockEffect[];
  }
}

export {};

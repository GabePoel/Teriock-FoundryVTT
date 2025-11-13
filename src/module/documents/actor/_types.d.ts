import TeriockBaseActorSheet from "../../applications/sheets/actor-sheets/base-actor-sheet/base-actor-sheet.mjs";
import { TeriockEffect, TeriockTokenDocument } from "../_module.mjs";

declare module "./actor.mjs" {
  export default interface TeriockActor
    extends Teriock.Documents.Interface<TeriockChild> {
    appliedEffects: TeriockEffect[];
    readonly itemTypes: Teriock.Parent.ParentItemTypes;
    sheet: TeriockBaseActorSheet;
    statuses: Set<Teriock.Parameters.Condition.ConditionKey>;
    readonly token: TeriockTokenDocument;

    get documentName(): "Actor";

    getDependentTokens(): TeriockTokenDocument[];

    get temporaryEffects(): TeriockEffect[];
  }
}

export {};

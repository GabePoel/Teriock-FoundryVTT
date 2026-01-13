import { TeriockEffect, TeriockTokenDocument } from "../_module.mjs";
import { BaseActorSystem } from "../../data/systems/actors/_module.mjs";
import { BaseActorSheet } from "../../applications/sheets/actor-sheets/_module.mjs";

declare module "./actor.mjs" {
  export default interface TeriockActor
    extends Teriock.Documents.Interface<TeriockChild> {
    appliedEffects: TeriockEffect[];
    readonly itemTypes: Teriock.Parent.ParentItemTypes;
    sheet: BaseActorSheet;
    statuses: Set<Teriock.Parameters.Condition.ConditionKey>;
    system: BaseActorSystem;
    readonly token: TeriockTokenDocument;

    get documentName(): "Actor";
    getDependentTokens(): TeriockTokenDocument[];
    get temporaryEffects(): TeriockEffect[];
  }
}

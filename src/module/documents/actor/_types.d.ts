import type TeriockBaseActorSheet from "../../applications/sheets/actor-sheets/base-actor-sheet/base-actor-sheet.mjs";
import { TeriockEffect, TeriockTokenDocument } from "../_module.mjs";

declare module "./actor.mjs" {
  export default interface TeriockActor
    extends Teriock.Documents.Interface<TeriockChild> {
    _id: Teriock.ID<TeriockActor>;
    appliedEffects: TeriockEffect[];
    readonly itemTypes: Teriock.Parent.ParentItemTypes;
    sheet: TeriockBaseActorSheet;
    statuses: Set<Teriock.Parameters.Condition.ConditionKey>;
    system: Teriock.Documents.ActorModel;
    readonly token: TeriockTokenDocument;
    type: Teriock.Documents.ActorType;

    get documentName(): "Actor";

    getDependentTokens(): TeriockTokenDocument[];

    get id(): Teriock.ID<TeriockActor>;

    get temporaryEffects(): TeriockEffect[];

    get uuid(): Teriock.UUID<TeriockActor>;
  }
}

export {};

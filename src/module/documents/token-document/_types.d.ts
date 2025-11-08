import { TeriockActor, TeriockCombat } from "../_module.mjs";
import { TeriockToken } from "../../canvas/placeables/_module.mjs";

declare module "./token-document.mjs" {
  export default interface TeriockTokenDocument
    extends Teriock.Documents.Interface<TeriockTokenDocument> {
    _id: Teriock.ID<TeriockTokenDocument>;
    readonly actor: TeriockActor | null;
    readonly combat: TeriockCombat | null;
    readonly object: TeriockToken;

    get documentName(): "TokenDocument";

    get id(): Teriock.ID<TeriockTokenDocument>;

    get uuid(): Teriock.UUID<TeriockTokenDocument>;
  }
}

export {};

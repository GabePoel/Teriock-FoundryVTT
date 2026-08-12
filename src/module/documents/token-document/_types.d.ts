import { TeriockCombat } from "../_module.mjs";
import { TeriockToken } from "../../canvas/placeables/_module.mjs";

declare module "./token-document.mjs" {
  export default interface TeriockTokenDocument {
    _id: ID<TeriockTokenDocument>;

    get actor(): AnyActor | null;
    get combat(): TeriockCombat | null;
    get documentName(): "TokenDocument";
    get id(): ID<TeriockTokenDocument>;
    get object(): TeriockToken;
    get uuid(): UUID<TeriockTokenDocument>;
  }
}

export {};

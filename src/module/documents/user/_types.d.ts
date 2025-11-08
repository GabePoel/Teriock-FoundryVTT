import { TeriockToken } from "../../canvas/placeables/_module.mjs";
import { TeriockActor, TeriockTokenDocument } from "../_module.mjs";

declare module "./user.mjs" {
  export default interface TeriockUser
    extends Teriock.Documents.Interface<TeriockTokenDocument> {
    _id: Teriock.ID<TeriockUser>;
    readonly character: TeriockActor | null;

    get documentName(): "User";

    get id(): Teriock.ID<TeriockUser>;

    get targets(): Set<TeriockToken>;

    get uuid(): Teriock.UUID<TeriockUser>;
  }
}

export {};

import { TeriockUser } from "../_module.mjs";
import { TeriockToken } from "../../canvas/placeables/_module.mjs";

declare global {
  namespace Teriock.Documents {
    export interface UserInterface {
      _id: ID<TeriockUser>;

      get character(): AnyActor | null;

      get documentName(): "User";

      get id(): ID<TeriockUser>;

      get targets(): Set<TeriockToken>;

      get uuid(): UUID<TeriockUser>;
    }
  }
}

export {};

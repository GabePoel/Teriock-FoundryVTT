import { TeriockCombat, TeriockTokenDocument } from "../_module.mjs";
import { TeriockToken } from "../../canvas/placeables/_module.mjs";
import { BaseTokenSheet } from "../../applications/sheets/token-sheets/_module.mjs";

declare global {
  namespace Teriock.Documents {
    export interface TokenDocumentInterface {
      _id: ID<TeriockTokenDocument>;
      sheet: BaseTokenSheet;

      get actor(): GenericActor | null;

      get combat(): TeriockCombat | null;

      get documentName(): "TokenDocument";

      get id(): ID<TeriockTokenDocument>;

      get object(): TeriockToken;

      get uuid(): UUID<TeriockTokenDocument>;
    }
  }
}

export {};

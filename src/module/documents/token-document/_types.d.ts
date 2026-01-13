import { TeriockActor, TeriockCombat } from "../_module.mjs";
import { TeriockToken } from "../../canvas/placeables/_module.mjs";
import { BaseTokenSheet } from "../../applications/sheets/token-sheets/_module.mjs";

declare module "./token-document.mjs" {
  export default interface TeriockTokenDocument
    extends Teriock.Documents.Interface<TeriockTokenDocument> {
    _id: ID<TeriockTokenDocument>;
    readonly actor: TeriockActor | null;
    readonly combat: TeriockCombat | null;
    readonly object: TeriockToken;
    sheet: BaseTokenSheet;

    get documentName(): "TokenDocument";

    get id(): ID<TeriockTokenDocument>;

    get uuid(): UUID<TeriockTokenDocument>;
  }
}

export {};

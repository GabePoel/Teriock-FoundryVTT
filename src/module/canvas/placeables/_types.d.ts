import { TeriockTokenDocument } from "../../documents/_module.mjs";

declare module "./token.mjs" {
  export default interface TeriockToken {
    document: TeriockTokenDocument;
  }
}

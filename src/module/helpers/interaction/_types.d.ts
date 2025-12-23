import "./action-handler/_types";
import "./command-handler/_types";
import {
  TeriockActor,
  TeriockTokenDocument,
} from "../../documents/_module.mjs";

declare module "./interaction-handler.mjs" {
  export default interface InteractionHandler {
    /** Default Actors */
    actors: TeriockActor[];
    /** Selected Actors */
    selectedActors: TeriockActor[];
    /** Selected Tokens */
    selectedTokens: TeriockTokenDocument[];
    /** Targeted Actors */
    targetedActors: TeriockActor[];
    /** Targeted Tokens */
    targetedTokens: TeriockTokenDocument[];
    /** Default Tokens */
    tokens: TeriockTokenDocument[];
  }
}

export {};

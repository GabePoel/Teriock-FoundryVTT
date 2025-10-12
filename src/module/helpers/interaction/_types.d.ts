import type TeriockActor from "../../documents/actor.mjs";
import type TeriockTokenDocument from "../../documents/token-document.mjs";

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

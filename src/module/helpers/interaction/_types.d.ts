import "./button-handlers/_types";
import "./command-handler/_types";
import { TeriockActor } from "../../documents/_module.mjs";
import { TeriockToken } from "../../canvas/placeables/_module.mjs";

declare module "./abstract-interaction-handler.mjs" {
  export default interface InteractionHandler {
    /** Default Actors */
    actors: TeriockActor[];
    /** Selected Actors */
    selectedActors: TeriockActor[];
    /** Selected Tokens */
    selectedTokens: TeriockToken[];
    /** Targeted Actors */
    targetedActors: TeriockActor[];
    /** Targeted Tokens */
    targetedTokens: TeriockToken[];
    /** Default Tokens */
    tokens: TeriockToken[];
  }
}

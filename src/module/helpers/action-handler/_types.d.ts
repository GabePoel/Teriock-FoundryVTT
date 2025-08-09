import type TeriockTokenDocument from "../../documents/token-document.mjs";
import type TeriockActor from "../../documents/actor.mjs";

declare module "./action-handler.mjs" {
  export default interface ActionHandler {
    /** Triggering Mouse Event */
    event: MouseEvent;
    /** HTML Element */
    element: HTMLElement;
    /** Dataset */
    dataset: DOMStringMap;

    /** Common Roll Options */
    commonRollOptions: Teriock.RollOptions.CommonRoll;
    /** Crit Roll Options */
    critRollOptions: Teriock.RollOptions.CritRoll;

    /** Selected Tokens */
    selectedTokens: TeriockTokenDocument[];
    /** Selected Actors */
    selectedActors: TeriockActor[];
    /** Targeted Tokens */
    targetedTokens: TeriockTokenDocument[];
    /** Targeted Actors */
    targetedActors: TeriockActor[];
    /** Default Tokens */
    tokens: TeriockTokenDocument[];
    /** Default Actors */
    actors: TeriockActor[];

    primaryAction(): Promise<void>;

    secondaryAction(): Promise<void>;
  }
}

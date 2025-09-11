import type TeriockTokenDocument from "../../../documents/token-document.mjs";
import type TeriockActor from "../../../documents/actor.mjs";

declare module "./action-handler.mjs" {
  export default interface ActionHandler {
    /** Default Actors */
    actors: TeriockActor[];
    /** Common Roll Options */
    commonRollOptions: Teriock.RollOptions.CommonRoll;
    /** Crit Roll Options */
    critRollOptions: Teriock.RollOptions.CritRoll;
    /** Dataset */
    dataset: DOMStringMap;
    /** HTML Element */
    element: HTMLElement;
    /** Triggering Mouse Event */
    event: MouseEvent;
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

    primaryAction(): Promise<void>;

    secondaryAction(): Promise<void>;
  }
}

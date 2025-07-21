import type TeriockToken from "../documents/token.mjs";
import type TeriockActor from "../documents/actor.mjs";

declare module "./action-handler.mjs" {
  export default interface ActionHandler {
    /** Triggering Mouse Event */
    event: MouseEvent;
    /** HTML Element */
    element: HTMLElement;
    /** Dataset */
    dataset: DOMStringMap;

    /** Common Roll Options */
    commonRollOptions: Teriock.CommonRollOptions;
    /** Crit Roll Options */
    critRollOptions: Teriock.CritRollOptions;

    /** Selected Tokens */
    selectedTokens: TeriockToken[];
    /** Selected Actors */
    selectedActors: TeriockActor[];
    /** Targeted Tokens */
    targetedTokens: TeriockToken[];
    /** Targeted Actors */
    targetedActors: TeriockActor[];
    /** Default Tokens */
    tokens: TeriockToken[];
    /** Default Actors */
    actors: TeriockActor[];

    primaryAction(): Promise<void>;
    secondaryAction(): Promise<void>;
  }
}

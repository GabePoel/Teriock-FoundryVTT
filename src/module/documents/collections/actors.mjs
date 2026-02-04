import { TeriockChatMessage } from "../_module.mjs";
import BaseWorldCollectionMixin from "./base-world-collection-mixin.mjs";

const { Actors } = foundry.documents.collections;

//noinspection JSUnusedGlobalSymbols,JSClosureCompilerSyntax,JSValidateJSDoc
/**
 * @extends {Actors}
 * @implements {TypeCollection<TeriockActor, TeriockActor>}
 * @implements {WorldCollection<TeriockActor>}
 * @property {Record<ID<TeriockActor>, TeriockActor>} tokens
 */
export default class TeriockActors extends BaseWorldCollectionMixin(Actors) {
  /**
   * Get the default actor for the current user.
   * @returns {TeriockActor|null}
   */
  get defaultActor() {
    const speaker = TeriockChatMessage.getSpeaker();
    const scene = game.scenes.get(speaker.scene);
    const token = scene.tokens.get(speaker.token);
    let actor = token?.actor;
    if (!actor) actor = this.get(speaker.actor);
    if (!actor) actor = game.user.character;
    if (!actor) {
      actor = game.canvas.tokens.controlled.find(
        /** @param {TeriockToken} t */ (t) => t.actor,
      )?.actor;
    }
    if (!actor) actor = ui?.activeWindow?.document?.actor;
    return actor ?? null;
  }
}

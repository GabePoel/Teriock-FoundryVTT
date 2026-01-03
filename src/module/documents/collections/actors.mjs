import { TeriockChatMessage } from "../_module.mjs";
import BaseWorldCollectionMixin from "./base-world-collection-mixin.mjs";

const { Actors } = foundry.documents.collections;

//noinspection JSUnusedGlobalSymbols,JSClosureCompilerSyntax,JSValidateJSDoc
/**
 * @extends {Actors}
 * @implements {Collection<ID<TeriockActor>, TeriockActor>}
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
    let actor = this.get(speaker.actor);
    if (!actor) {
      const scene = game.scenes.get(speaker.scene);
      const token = scene.tokens.get(speaker.token);
      actor = token?.actor;
    }
    if (!actor) actor = game.user.character;
    if (!actor)
      actor = game.canvas.tokens.controlled.find(
        /** @param {TeriockToken} t */ (t) => t.actor,
      )?.actor;
    return actor ?? null;
  }
}

import BaseWorldCollectionMixin from "./base-world-collection-mixin.mjs";

const { Actors } = foundry.documents.collections;

//noinspection JSUnusedGlobalSymbols,JSClosureCompilerSyntax
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
    const speaker = ChatMessage.implementation.getSpeaker();
    const character = game.user.character;
    const token =
      (canvas.ready ? canvas.tokens.get(speaker.token) : null) || null;
    return token?.actor || this.get(speaker.actor) || character || null;
  }
}

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
  get default() {
    const speaker = TeriockChatMessage.getSpeaker();
    const scene = game.scenes.get(speaker.scene);
    const token = scene?.tokens.get(speaker.token);
    let actor = token?.actor;
    if (!actor) actor = this.get(speaker.actor);
    if (!actor) actor = game.user.character;
    if (!actor) {
      actor = game.canvas?.tokens?.controlled.find(
        /** @param {TeriockToken} t */ (t) => t.actor,
      )?.actor;
    }
    if (!actor) actor = ui?.activeWindow?.document?.actor;
    return actor ?? null;
  }

  /**
   * All the actors which are designated as characters.
   * @returns {TeriockActor[]}
   */
  get pcs() {
    return game.users.filter((u) => u.character).map((u) => u.character);
  }

  /**
   * All the currently relevant actors. They are either visible or PCs.
   * @returns {TeriockActor[]}
   */
  get relevant() {
    return Array.from(new Set([...this.pcs, ...this.visible]));
  }

  /**
   * All the actors visible in the current scene.
   * @returns {TeriockActor[]}
   */
  get visible() {
    return game.scenes.viewed.tokens
      .filter((token) => token.actor)
      .map((token) => token.actor);
  }
}

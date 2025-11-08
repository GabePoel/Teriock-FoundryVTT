/**
 * Class that provides common fields to be referenced.
 */
export default class InteractionHandler {
  constructor() {
    //noinspection JSUnresolvedReference
    const tokenLayer = /** @type {TokenLayer} */ game.canvas.tokens;
    const user = game.user;
    this.selectedTokens =
      /** @type {TeriockTokenDocument[]} */ tokenLayer.controlled.filter(
        (t) => t,
      );
    this.selectedActors = /** @type {TeriockActor[]} */ this.selectedTokens
      .map((t) => t.actor)
      .filter((a) => a);
    this.targetedTokens = /** @type {TeriockTokenDocument[]} */ Array.from(
      user.targets,
    ).filter((t) => t);
    this.targetedActors = /** @type {TeriockActor[]} */ this.targetedTokens
      .map((t) => t.actor)
      .filter((a) => a);
    this.tokens = this.selectedTokens;
    this.actors = this.selectedActors;
  }
}

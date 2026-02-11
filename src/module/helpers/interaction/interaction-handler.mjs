/**
 * Class that provides common fields to be referenced.
 */
export default class InteractionHandler {
  constructor() {
    //noinspection JSUnresolvedReference,JSValidateJSDoc
    const tokenLayer = /** @type {TokenLayer} */ game.canvas.tokens;
    const user = game.user;
    const defaultActor = game.actors.defaultActor;
    this.selectedTokens =
      /** @type {TeriockTokenDocument[]} */
      tokenLayer.controlled.filter((t) => t);
    this.selectedActors =
      this.selectedTokens.map((t) => t.actor).filter((a) => a) || defaultActor
        ? [defaultActor]
        : [];
    this.targetedTokens = Array.from(user.targets).filter((t) => t);
    this.targetedActors = this.targetedTokens
      .map((t) => t.actor)
      .filter((a) => a);
    this.tokens = this.selectedTokens;
    this.actors = this.selectedActors;
  }
}

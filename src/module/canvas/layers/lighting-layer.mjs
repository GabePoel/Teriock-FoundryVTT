const { LightingLayer } = foundry.canvas.layers;

/** @inheritDoc */
export default class TeriockLightingLayer extends LightingLayer {
  /**
   * Whether the Ethereal is currently visible.
   * @return {boolean}
   */
  get isEtherealVisible() {
    const visionSources = game.canvas.effects.visionSources;
    if (game.user.isGM && !visionSources.some((source) => source.active)) { return true; }
    return visionSources.some((source) => source.active && source.object?.isEthereal);
  }
}

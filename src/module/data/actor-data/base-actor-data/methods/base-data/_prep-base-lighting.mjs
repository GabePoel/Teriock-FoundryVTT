/**
 * Lighting for the {@link TeriockTokenDocument} to inherit.
 * @param {TeriockBaseActorData} actorData
 * @private
 */
export function _prepBaseLighting(actorData) {
  actorData.light = {
    negative: false,
    priority: 0,
    alpha: 0.5,
    angle: 360,
    bright: 0,
    color: "#000000",
    coloration: 1,
    dim: 0,
    attenuation: 0.5,
    luminosity: 0.5,
    saturation: 0,
    contrast: 0,
    shadows: 0,
    animation: {
      type: null,
      speed: 5,
      intensity: 5,
      reverse: false,
    },
    darkness: {
      min: 0,
      max: 1,
    },
  };
}

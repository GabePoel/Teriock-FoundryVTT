const { VisionMode } = foundry.canvas.perception;
const { shaders } = foundry.canvas.rendering;

/**
 * Everything goes black. If a creature is both Ethereal and invisible, they are detached from the world in a way that seems to call forth morganti beings.
 *
 *
 * Relevant wiki pages:
 * - [Ethereal](https://wiki.teriock.com/index.php/Condition:Ethereal)
 * - [Invisible](https://wiki.teriock.com/index.php/Condition:Invisible)
 * - [Morganti](https://wiki.teriock.com/index.php/Property:Morganti)
 *
 * @returns {VisionMode}
 */
export default function invisibleEtherealVisionMode() {
  return new VisionMode(
    {
      id: "invisibleEthereal",
      label: "Invisible Ethereal",
      canvas: {
        shader: shaders.ColorAdjustmentsSamplerShader,
        uniforms: {
          contrast: 1,
          saturation: -1.0,
          brightness: -2,
          tint: [0, 0, 0],
        },
      },
      lighting: {
        background: { visibility: VisionMode.LIGHTING_VISIBILITY.DISABLED },
        illumination: { visibility: VisionMode.LIGHTING_VISIBILITY.DISABLED },
        coloration: { visibility: VisionMode.LIGHTING_VISIBILITY.DISABLED },
        darkness: { visibility: VisionMode.LIGHTING_VISIBILITY.DISABLED },
      },
      vision: {
        darkness: { adaptive: false },
        defaults: {
          attenuation: 0,
          contrast: 1,
          saturation: -1.0,
          brightness: -1,
          color: "#000000",
        },
      },
    },
    { animated: true },
  );
}

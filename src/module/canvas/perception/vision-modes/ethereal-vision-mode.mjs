import { EtherealBackgroundVisionShader, EtherealColorationVisionShader } from "../../rendering/shaders/_module.mjs";

const { VisionMode } = foundry.canvas.perception;
const { shaders } = foundry.canvas.rendering;

const DESATURATION = { postProcessingModes: ["SATURATION"], uniforms: { saturation: -0.75, tint: [1, 1, 1] } };

/**
 * Everything is in black and white, and there's an odd emanating haze.
 *
 * Relevant wiki pages:
 * - [Ethereal](https://wiki.teriock.com/index.php/Condition:Ethereal)
 *
 * @returns {VisionMode}
 */
export default function etherealVisionMode() {
  return new VisionMode({
    canvas: {
      shader: shaders.ColorAdjustmentsSamplerShader,
      uniforms: { brightness: 0, contrast: 0, saturation: -0.75 },
    },
    id: "ethereal",
    label: "TERIOCK.PERCEPTION.VisionModes.ethereal",
    lighting: { background: DESATURATION, coloration: DESATURATION, illumination: DESATURATION },
    vision: {
      background: { shader: EtherealBackgroundVisionShader },
      coloration: { shader: EtherealColorationVisionShader },
      darkness: { adaptive: false },
      defaults: { attenuation: 0, brightness: 0, color: "#555555", contrast: 0, saturation: 0.25 },
    },
  }, { animated: true });
}

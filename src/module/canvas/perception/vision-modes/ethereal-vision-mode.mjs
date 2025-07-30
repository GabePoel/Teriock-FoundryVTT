const { VisionMode } = foundry.canvas.perception;
const { shaders } = foundry.canvas.rendering;
import {
  EtherealBackgroundVisionShader,
  EtherealColorationVisionShader,
} from "../../rendering/ethereal-shaders.mjs";

export default function etherealVisionMode() {
  return new VisionMode(
    {
      id: "ethereal",
      label: "Ethereal",
      canvas: {
        shader: shaders.ColorAdjustmentsSamplerShader,
        uniforms: {
          contrast: 0,
          saturation: -1,
          brightness: 0,
        },
      },
      lighting: {
        background: {
          postProcessingModes: ["SATURATION"],
          uniforms: { saturation: -1.0, tint: [1, 1, 1] },
        },
        illumination: {
          postProcessingModes: ["SATURATION"],
          uniforms: { saturation: -1.0, tint: [1, 1, 1] },
        },
        coloration: { visibility: VisionMode.LIGHTING_VISIBILITY.DISABLED },
      },
      vision: {
        darkness: { adaptive: false },
        background: { shader: EtherealBackgroundVisionShader },
        coloration: { shader: EtherealColorationVisionShader },
        defaults: {
          attenuation: 0,
          contrast: 0,
          saturation: -1,
          brightness: 0,
          color: null,
        },
      },
    },
    { animated: true },
  );
}

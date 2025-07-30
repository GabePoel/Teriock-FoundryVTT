import {
  EtherealBackgroundVisionShader,
  EtherealColorationVisionShader,
} from "./filters/ethereal-shaders.mjs";
import {
  WoundedBackgroundVisionShader,
  WoundedColorationVisionShader,
} from "./filters/wounded-shader.mjs";

const { shaders } = foundry.canvas.rendering;
const { VisionMode } = foundry.canvas.perception;

export const teriockVisionModes = {
  down: new VisionMode(
    {
      id: "down",
      label: "Down",
      canvas: {
        shader: shaders.ColorAdjustmentsSamplerShader,
        uniforms: { contrast: 0, saturation: -0.8, exposure: -0.65 },
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
          contrast: 0.2,
          saturation: -0.3,
          brightness: 1,
          color: "#a36767",
        },
        background: { shader: WoundedBackgroundVisionShader },
        coloration: { shader: WoundedColorationVisionShader },
      },
    },
    { animated: false },
  ),
  dead: new VisionMode(
    {
      id: "dead",
      label: "Dead",
      canvas: {
        shader: shaders.ColorAdjustmentsSamplerShader,
        uniforms: { contrast: 0, saturation: -0.8, exposure: -0.65 },
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
          contrast: 0.2,
          saturation: -0.3,
          brightness: 1,
          color: "#ff0000",
        },
        background: { shader: WoundedBackgroundVisionShader },
        coloration: { shader: WoundedColorationVisionShader },
      },
    },
    { animated: false },
  ),
  ethereal: new VisionMode(
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
  ),
  invisibleEthereal: new VisionMode({
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
  }),
};

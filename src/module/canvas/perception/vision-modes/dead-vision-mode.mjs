const { VisionMode } = foundry.canvas.perception;
const { shaders } = foundry.canvas.rendering;
import {
  WoundedBackgroundVisionShader,
  WoundedColorationVisionShader,
} from "../../rendering/wounded-shader.mjs";

export default function deadVisionMode() {
  return new VisionMode(
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
  );
}

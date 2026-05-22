const { shaders } = foundry.canvas.rendering;
import { WoundedBackgroundVisionShader, WoundedColorationVisionShader } from "../../rendering/wounded-shader.mjs";
import TeriockVisionMode from "./base-vision-mode.mjs";

/**
 * Everything turns a pale red.
 *
 * @returns {VisionMode}
 */
export default function downVisionMode() {
  return new TeriockVisionMode({
    canvas: {
      shader: shaders.ColorAdjustmentsSamplerShader,
      uniforms: { contrast: 0, exposure: -0.65, saturation: -0.8 },
    },
    id: "down",
    label: "TERIOCK.PERCEPTION.VisionModes.down",
    lighting: {
      background: { visibility: TeriockVisionMode.LIGHTING_VISIBILITY.DISABLED },
      darkness: { visibility: TeriockVisionMode.LIGHTING_VISIBILITY.DISABLED },
      illumination: { visibility: TeriockVisionMode.LIGHTING_VISIBILITY.DISABLED },
    },
    vision: {
      background: { shader: WoundedBackgroundVisionShader },
      coloration: { shader: WoundedColorationVisionShader },
      darkness: { adaptive: false },
      defaults: { attenuation: 0, brightness: 1, color: "#a36767", contrast: 0.2, saturation: -0.3 },
    },
  }, { animated: false });
}

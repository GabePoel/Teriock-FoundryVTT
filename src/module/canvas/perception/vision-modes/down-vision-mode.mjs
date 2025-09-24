const { shaders } = foundry.canvas.rendering;
import {
  WoundedBackgroundVisionShader,
  WoundedColorationVisionShader,
} from "../../rendering/wounded-shader.mjs";
import TeriockVisionMode from "./base-vision-mode.mjs";

/**
 * Everything turns a pale red.
 *
 * @returns {VisionMode}
 */
export default function downVisionMode() {
  return new TeriockVisionMode(
    {
      id: "down",
      label: "Down",
      canvas: {
        shader: shaders.ColorAdjustmentsSamplerShader,
        uniforms: {
          contrast: 0,
          saturation: -0.8,
          exposure: -0.65,
        },
      },
      lighting: {
        background: {
          visibility: TeriockVisionMode.LIGHTING_VISIBILITY.DISABLED,
        },
        illumination: {
          visibility: TeriockVisionMode.LIGHTING_VISIBILITY.DISABLED,
        },
        darkness: {
          visibility: TeriockVisionMode.LIGHTING_VISIBILITY.DISABLED,
        },
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
  );
}

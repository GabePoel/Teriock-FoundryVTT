import { WoundedBackgroundVisionShader, WoundedColorationVisionShader } from "../../rendering/shaders/_module.mjs";

const { VisionMode } = foundry.canvas.perception;

/**
 * Everything turns intensely red.
 *
 * @returns {VisionMode}
 */
export default function deadVisionMode() {
  return new VisionMode({
    canvas: {
      shader: foundry.canvas.rendering.shaders.ColorAdjustmentsSamplerShader,
      uniforms: { contrast: 0, exposure: -0.65, saturation: -0.8 },
    },
    id: "dead",
    label: "TERIOCK.PERCEPTION.VisionModes.dead",
    lighting: {
      background: { visibility: VisionMode.LIGHTING_VISIBILITY.DISABLED },
      darkness: { visibility: VisionMode.LIGHTING_VISIBILITY.DISABLED },
      illumination: { visibility: VisionMode.LIGHTING_VISIBILITY.DISABLED },
    },
    vision: {
      background: { shader: WoundedBackgroundVisionShader },
      coloration: { shader: WoundedColorationVisionShader },
      darkness: { adaptive: false },
      defaults: { attenuation: 0, brightness: 1, color: "#ff0000", contrast: 0.2, saturation: -0.3 },
    },
  }, { animated: false });
}

const { VisionMode } = foundry.canvas.perception;

export const teriockVisionModes = {
  ethereal: new VisionMode({
    id: "ethereal",
    label: "Ethereal",
    canvas: {
      shader: ColorAdjustmentsSamplerShader,
      uniforms: {
        contrast: 0,
        saturation: -1,
        brightness: 0,
      }
    },
    lighting: {
      background: {
        postProcessingModes: ["SATURATION"],
        uniforms: { saturation: -1.0, tint: [1, 1, 1] }
      },
      illumination: {
        postProcessingModes: ["SATURATION"],
        uniforms: { saturation: -1.0, tint: [1, 1, 1] }
      },
      coloration: {
        postProcessingModes: ["SATURATION"],
        uniforms: { saturation: -1.0, tint: [1, 1, 1] }
      }
    },
    vision: {
      darkness: { adaptive: false },
      defaults: { attenuation: 0, contrast: 0, saturation: -1, brightness: 0 }
    }
  }),
  blind: new VisionMode({
    id: "blind",
    label: "Blind",
    canvas: {
      shader: ColorAdjustmentsSamplerShader,
      uniforms: { contrast: 0, saturation: -0.8, exposure: -0.65 }
    },
    lighting: {
      background: { visibility: VisionMode.LIGHTING_VISIBILITY.DISABLED },
      illumination: { visibility: VisionMode.LIGHTING_VISIBILITY.DISABLED },
      coloration: { visibility: VisionMode.LIGHTING_VISIBILITY.DISABLED },
      darkness: { visibility: VisionMode.LIGHTING_VISIBILITY.DISABLED },
    },
    vision: {
      darkness: { adaptive: false },
      defaults: { attenuation: 0, contrast: 0.2, saturation: -0.3, brightness: 1 },
      background: { shader: WaveBackgroundVisionShader },
      coloration: { shader: WaveColorationVisionShader }
    }
  }, { animated: true }),
  invisibleEthereal: new VisionMode({
    id: "invisibleEthereal",
    label: "Invisible Ethereal",
    canvas: {
      shader: ColorAdjustmentsSamplerShader,
      uniforms: {
        contrast: 1,
        saturation: -1.0,
        brightness: -2,
      },
      blendMode: PIXI.BLEND_MODES.MULTIPLY
    },
    lighting: {
      background: {
        postProcessingModes: ["SATURATION"],  // must be valid
        uniforms: {
          contrast: 1,
          saturation: -1.0,
          brightness: -2
        }
      },
      illumination: {
        postProcessingModes: ["SATURATION"],
        uniforms: {
          contrast: 1,
          saturation: -1.0,
          brightness: -2
        }
      },
      coloration: {
        postProcessingModes: ["SATURATION"],
        uniforms: {
          contrast: 1,
          saturation: -1.0,
          brightness: -2
        }
      }
    },
    vision: {
      darkness: { adaptive: false },
      defaults: {
        attenuation: 0,
        contrast: 1,
        saturation: -1.0,
        brightness: -2
      }
    }
  }, { animated: true })
}
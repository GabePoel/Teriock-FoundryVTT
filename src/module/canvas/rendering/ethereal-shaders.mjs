const { BackgroundVisionShader, ColorationVisionShader } =
  foundry.canvas.rendering.shaders;

/**
 * Simple spooky background vision shader
 */
export class EtherealBackgroundVisionShader extends BackgroundVisionShader {
  /** @inheritdoc */
  static get defaultUniforms() {
    return {
      ...super.defaultUniforms,
      colorTint: [0.5, 0.6, 0.8],
    };
  }

  /** @override */
  static _createFragmentShader() {
    return `
    ${this.SHADER_HEADER}
    ${this.WAVE()}
    ${this.PERCEIVED_BRIGHTNESS}
    
    void main() {
      ${this.FRAGMENT_BEGIN}    
      
      // Simple time-based animation
      float t = time * -8.0;
      
      // Create a simple vignette effect (darker edges)
      float vignette = 1.0 - length(vUvs - 0.5) * 1.5;
      vignette = clamp(vignette, 0.0, 1.0);
      
      // Simple pulsing effect
      float pulse = sin(t * 0.2) * 0.2 + 0.8;
      
      // Desaturate the base color for spooky effect
      vec3 grey = vec3(perceivedBrightness(baseColor.rgb));
      vec3 spookyColor = mix(baseColor.rgb, grey, 0.7);
      
      // Apply vignette and pulse
      spookyColor *= vignette * pulse;
      
      // Apply the color tint
      finalColor = spookyColor * colorTint;
      
      ${this.ADJUSTMENTS}
      ${this.BACKGROUND_TECHNIQUES}
      ${this.FALLOFF}
      ${this.FRAGMENT_END}
    }`;
  }

  /** @inheritdoc */
  get isRequired() {
    return true;
  }
}

/**
 * Simple spooky coloration vision shader
 */
export class EtherealColorationVisionShader extends ColorationVisionShader {
  /** @inheritdoc */
  static get defaultUniforms() {
    return {
      ...super.defaultUniforms,
      colorEffect: [0.4, 0.5, 0.8],
    };
  }

  /** @override */
  static _createFragmentShader() {
    return `
    ${this.SHADER_HEADER}
    ${this.WAVE()}
    ${this.PERCEIVED_BRIGHTNESS}
      
    void main() {
      ${this.FRAGMENT_BEGIN}
      
      // Simple time-based animation
      float t = time * -8.0;
      
      // Create simple ripple effect from center
      float distFromCenter = distance(vUvs, vec2(0.5, 0.5));
      float ripple = sin(distFromCenter * 20.0 + t * 0.2) * 0.5 + 0.5;
      
      // Fade the ripple based on distance
      ripple *= 1.0 - smoothstep(0.0, 0.7, distFromCenter);
      
      // Add a simple flicker
      float flicker = sin(t * 0.5) * 0.1 + 0.9;
      
      // Combine effects
      float ghostEffect = ripple * flicker;
      
      // Apply the color effect
      finalColor = vec3(ghostEffect) * colorEffect;
      
      ${this.COLORATION_TECHNIQUES}
      ${this.ADJUSTMENTS}
      ${this.FALLOFF}
      ${this.FRAGMENT_END}
    }`;
  }

  /** @inheritdoc */
  get isRequired() {
    return true;
  }
}

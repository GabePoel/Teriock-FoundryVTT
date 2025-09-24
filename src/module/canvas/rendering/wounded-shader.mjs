const { BackgroundVisionShader, ColorationVisionShader } =
  foundry.canvas.rendering.shaders;

/**
 * Wounded vision shader - creates red vignette effect for a down/dead {@link TeriockTokenDocument}
 */
export class WoundedBackgroundVisionShader extends BackgroundVisionShader {
  /** @inheritdoc */
  static defaultUniforms = {
    ...super.defaultUniforms,
    colorTint: [1.0, 1.0, 1.0],
  };

  /** @inheritdoc */
  static fragmentShader = `
  ${this.SHADER_HEADER}
  ${this.WAVE()}
  ${this.PERCEIVED_BRIGHTNESS}
  
  void main() {
    ${this.FRAGMENT_BEGIN}    
    
    // Calculate distance from center
    float newDist = distance(vUvs, vec2(0.5, 0.5));
    
    // Create vignette (0 at edges, 1 at center)
    float vignette = 1.0 - smoothstep(0.3, 0.8, newDist);
    
    // Mix between original color and red based on vignette
    vec3 redTint = vec3(1.0, 0.0, 0.0);
    finalColor = mix(redTint, baseColor.rgb, vignette);
    
    ${this.ADJUSTMENTS}
    ${this.BACKGROUND_TECHNIQUES}
    ${this.FALLOFF}
    ${this.FRAGMENT_END}
  }`;

  /** @inheritdoc */
  get isRequired() {
    return true;
  }
}

/**
 * Wounded coloration vision shader - adds red overlay at edges
 */
export class WoundedColorationVisionShader extends ColorationVisionShader {
  /** @inheritdoc */
  static defaultUniforms = {
    ...super.defaultUniforms,
    colorEffect: [1.0, 0.0, 0.0], // Pure red
  };

  /** @inheritdoc */
  static fragmentShader = `
  ${this.SHADER_HEADER}
  ${this.WAVE()}
  ${this.PERCEIVED_BRIGHTNESS}
    
  void main() {
    ${this.FRAGMENT_BEGIN}
    
    // Calculate distance from center
    float newDist = distance(vUvs, vec2(0.5, 0.5));
    
    // Create red ring at edges
    float ring = smoothstep(0.4, 0.7, newDist);
    
    // Set red color intensity based on ring
    finalColor = vec3(ring, 0.0, 0.0);
    
    ${this.COLORATION_TECHNIQUES}
    ${this.ADJUSTMENTS}
    ${this.FALLOFF}
    ${this.FRAGMENT_END}
  }`;

  /** @inheritdoc */
  get isRequired() {
    return true;
  }
}

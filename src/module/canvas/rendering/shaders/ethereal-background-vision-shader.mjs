const { BackgroundVisionShader } = foundry.canvas.rendering.shaders;

/**
 * Simple spooky background vision shader
 */
export default class EtherealBackgroundVisionShader extends BackgroundVisionShader {
  /** @inheritdoc */
  static get defaultUniforms() {
    return { ...super.defaultUniforms, colorTint: [0.5, 0.6, 0.8] };
  }

  /** @override */
  static _createFragmentShader() {
    return `
    ${this.SHADER_HEADER}
    ${this.WAVE()}
    ${this.PERCEIVED_BRIGHTNESS}
    
    void main() {
      ${this.FRAGMENT_BEGIN}    
      
      float t = time * -8.0;      
      float vignette = 1.0 - length(vUvs - 0.5) * 1.5;
      vignette = clamp(vignette, 0.0, 1.0);
      float pulse = sin(t * 0.2) * 0.2 + 0.8;
      vec3 grey = vec3(perceivedBrightness(baseColor.rgb));
      vec3 spookyColor = mix(baseColor.rgb, grey, 0.7);
      spookyColor *= vignette * pulse;
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

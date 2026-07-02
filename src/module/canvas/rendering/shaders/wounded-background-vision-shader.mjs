const { BackgroundVisionShader } = foundry.canvas.rendering.shaders;

/**
 * Wounded vision shader - creates red vignette effect for a down/dead {@link TeriockTokenDocument}
 */
export default class WoundedBackgroundVisionShader extends BackgroundVisionShader {
  /** @inheritdoc */
  static get defaultUniforms() {
    return { ...super.defaultUniforms, colorTint: [1.0, 1.0, 1.0] };
  }

  /** @override */
  static _createFragmentShader() {
    return `
    ${this.SHADER_HEADER}
    ${this.WAVE()}
    ${this.PERCEIVED_BRIGHTNESS}
    
    void main() {
      ${this.FRAGMENT_BEGIN}    
      
      float newDist = distance(vUvs, vec2(0.5, 0.5));
      float vignette = 1.0 - smoothstep(0.3, 0.8, newDist);
      vec3 redTint = vec3(1.0, 0.0, 0.0);
      finalColor = mix(redTint, baseColor.rgb, vignette);
      
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

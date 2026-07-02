const { ColorationVisionShader } = foundry.canvas.rendering.shaders;

/**
 * Wounded coloration vision shader - adds red overlay at edges
 */
export default class WoundedColorationVisionShader extends ColorationVisionShader {
  /** @inheritdoc */
  static get defaultUniforms() {
    return {
      ...super.defaultUniforms,
      colorEffect: [1.0, 0.0, 0.0], // Pure red
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
      
      float newDist = distance(vUvs, vec2(0.5, 0.5));
      float ring = smoothstep(0.4, 0.7, newDist);      
      finalColor = vec3(ring, 0.0, 0.0);
      
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

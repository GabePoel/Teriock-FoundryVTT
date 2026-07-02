const { ColorationVisionShader } = foundry.canvas.rendering.shaders;

/**
 * Simple spooky coloration vision shader
 */
export default class EtherealColorationVisionShader extends ColorationVisionShader {
  /** @inheritdoc */
  static get defaultUniforms() {
    return { ...super.defaultUniforms, colorEffect: [0.4, 0.5, 0.8] };
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
      float distFromCenter = distance(vUvs, vec2(0.5, 0.5));
      float ripple = sin(distFromCenter * 20.0 + t * 0.2) * 0.5 + 0.5;
      ripple *= 1.0 - smoothstep(0.0, 0.7, distFromCenter);
      float flicker = sin(t * 0.5) * 0.1 + 0.9;
      float ghostEffect = ripple * flicker;
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

const { AbstractBaseFilter } = foundry.canvas.rendering.filters;

/**
 * A ghostly filter with a static desaturated layer + animated blur overlay.
 */
export default class EtherealFilter extends AbstractBaseFilter {
  static defaultUniforms = {
    blur: 1.0,
    desaturate: 1.0,
    time: 0,
  };
  static fragmentShader = `
    precision mediump float;
    varying vec2 vTextureCoord;

    uniform sampler2D uSampler;
    uniform vec4 inputSize;
    uniform float blur;
    uniform float desaturate;
    uniform float time;

    float random(vec2 co) {
      return fract(sin(dot(co.xy, vec2(12.9898,78.233))) * 43758.5453);
    }

    vec4 desaturateColor(vec4 color, float amount) {
      float gray = dot(color.rgb, vec3(0.3, 0.59, 0.11));
      return vec4(mix(color.rgb, vec3(gray), amount), color.a);
    }

    vec4 getGhostlyBlur(vec2 coord) {
      vec2 px = inputSize.zw * blur;
      vec4 sum = vec4(0.0);
      float totalWeight = 0.0;

      for (float i = 0.0; i < 12.0; i++) {
        float angle = i * 6.28318 / 12.0 + time * 0.001;
        float dist = 1.0 + 1.5 * sin(time * 0.002 + i);
        vec2 dir = vec2(cos(angle), sin(angle));
        vec2 offset = dir * px * dist;

        float weight = 1.0 / (dist * dist + 1.0);
        vec2 sampleCoord = coord + offset;

        float n = random(sampleCoord + time * 0.0003) * 0.001;
        sampleCoord += n;

        sum += texture2D(uSampler, sampleCoord) * weight;
        totalWeight += weight;
      }

      return sum / totalWeight;
    }

    void main() {
      vec4 baseColor = texture2D(uSampler, vTextureCoord);
      vec4 staticLayer = desaturateColor(baseColor, desaturate);         // base ghost image
      vec4 animatedMist = desaturateColor(getGhostlyBlur(vTextureCoord), desaturate); // floating mist
      vec4 result = mix(staticLayer, animatedMist, 0.9); // blend layers
      gl_FragColor = result;
    }
  `;
  static vertexShader = `
    precision mediump float;
    attribute vec2 aVertexPosition;
    uniform mat3 projectionMatrix;
    uniform vec4 inputSize;
    uniform vec4 outputFrame;
    varying vec2 vTextureCoord;

    void main(void) {
      vec2 position = aVertexPosition * max(outputFrame.zw, vec2(0.0)) + outputFrame.xy;
      gl_Position = vec4((projectionMatrix * vec3(position, 1.0)).xy, 0.0, 1.0);
      vTextureCoord = aVertexPosition * (outputFrame.zw * inputSize.zw);
    }
  `;
  padding = 10;
  animated = true;

  static create(initialUniforms = {}) {
    const uniforms = { ...this.defaultUniforms, ...initialUniforms };
    const filter = new this(this.vertexShader, this.fragmentShader, uniforms);
    filter.blendMode = PIXI.BLEND_MODES.NORMAL;
    return filter;
  }

  apply(filterManager, input, output, clear) {
    if (this.animated && !canvas.photosensitiveMode) {
      this.uniforms.time = canvas.app.ticker.lastTime;
    }
    filterManager.applyFilter(this, input, output, clear);
  }
}

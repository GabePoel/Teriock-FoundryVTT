const { MeasuredTemplate } = foundry.canvas.placeables;

export default class TeriockMeasuredTemplate extends MeasuredTemplate {
  /**
   * Is the token contained in this measured template?
   * @param {TeriockToken} token
   */
  testToken(token) {
    let contained = false;
    if (
      token.scene &&
      this.scene &&
      token.scene.uuid === this.scene.uuid &&
      token.document
    ) {
      const polygonPath = token.shape.toPolygon().points;
      /** @type {Point[]} */
      const testPoints = [];
      for (let i = 0; i < polygonPath.length; i += 2) {
        testPoints.push({
          x: polygonPath[i] + token.document.x,
          y: polygonPath[i + 1] + token.document.y,
        });
      }
      for (const point of testPoints) {
        if (this.testPoint(point)) {
          contained = true;
        }
      }
    }
    return contained;
  }
}

import EtherealLightSourceMixin from "./ethereal-light-source-mixin.mjs";

const { PointDarknessSource } = foundry.canvas.sources;

/**
 * @inheritDoc
 * @mixes EtherealLightSource
 */
export default class TeriockPointDarknessSource extends EtherealLightSourceMixin(PointDarknessSource) {}

import EtherealLightSourceMixin from "./ethereal-light-source-mixin.mjs";

const { PointDarknessSource } = foundry.canvas.sources;

/**
 * @mixes EtherealLightSource
 * @inheritDoc
 */
export default class TeriockPointDarknessSource extends EtherealLightSourceMixin(PointDarknessSource) {}

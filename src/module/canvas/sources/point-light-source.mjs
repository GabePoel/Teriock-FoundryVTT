import EtherealLightSourceMixin from "./ethereal-light-source-mixin.mjs";

const { PointLightSource } = foundry.canvas.sources;

/**
 * @inheritDoc
 * @mixes EtherealLightSource
 */
export default class TeriockPointLightSource extends EtherealLightSourceMixin(PointLightSource) {}

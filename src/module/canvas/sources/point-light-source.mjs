import EtherealLightSourceMixin from "./ethereal-light-source-mixin.mjs";

const { PointLightSource } = foundry.canvas.sources;

/**
 * @extends {PointLightSource}
 * @mixes EtherealLightSource
 * @inheritDoc
 */
export default class TeriockPointLightSource extends EtherealLightSourceMixin(PointLightSource) {}

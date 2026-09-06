import { mixClasses } from "../../helpers/construction.mjs";
import EtherealLightSourceMixin from "./ethereal-light-source-mixin.mjs";

const { PointLightSource } = foundry.canvas.sources;

/**
 * @mixes EtherealLightSource
 * @inheritDoc
 */
export default class TeriockPointLightSource extends mixClasses(PointLightSource, EtherealLightSourceMixin) {}

import { EtherealConfigMixin } from "./mixins/_module.mjs";

const { AmbientLightConfig } = foundry.applications.sheets;

/** @inheritDoc */
export default class TeriockAmbientLightConfig extends EtherealConfigMixin(AmbientLightConfig) {
  /** @inheritDoc */
  get etherealInsertAfter() {
    return "walls";
  }
}

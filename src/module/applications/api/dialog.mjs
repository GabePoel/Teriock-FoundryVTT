import { bindCommonActions } from "../shared/_module.mjs";

const { DialogV2 } = foundry.applications.api;

/** @inheritDoc */
export default class TeriockDialog extends DialogV2 {
  /** @inheritDoc */
  async _onRender(context, options) {
    await super._onRender(context, options);
    bindCommonActions(this.element);
  }
}

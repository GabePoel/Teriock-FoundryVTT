import { BaseTeriockMessage } from "./_base.mjs";

export default class TeriockMessage extends BaseTeriockMessage {
  /** @inheritDoc */
  async renderHTML(options) {
    const html = await super.renderHTML(options);
    await this.system.alterMessageHTML(html);
    return html;
  }
}

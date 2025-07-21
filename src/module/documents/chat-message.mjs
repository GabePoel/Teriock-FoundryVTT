import { BaseTeriockChatMessage } from "./_base.mjs";

export default class TeriockChatMessage extends BaseTeriockChatMessage {
  /** @inheritDoc */
  async renderHTML(options) {
    const html = await super.renderHTML(options);
    await this.system.alterMessageHTML(html);
    return html;
  }
}

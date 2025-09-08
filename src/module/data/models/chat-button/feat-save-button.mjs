import BaseChatButton from "./base/base-chat-button.mjs";

export default class FeatSaveButton extends BaseChatButton {
  /** @inheritDoc */
  async primaryAction() {
    if (!isNaN(Number(this.data.dc))) {
      this.commonRollOptions.threshold = Number(this.data.dc);
    }
    for (const actor of this.actors) {
      await actor.rollFeatSave(this.data.attribute, this.commonRollOptions);
    }
  }
}

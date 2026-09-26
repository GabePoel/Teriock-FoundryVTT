import { mergeMetadata, mixClasses } from "../../../helpers/construction.mjs";
import { TriggerMechanicMixin } from "../mixins/_module.mjs";
import { BaseExpiration } from "./abstract/_module.mjs";

/**
 * @mixes TriggerMechanic
 */
export default class TriggerExpiration extends mixClasses(BaseExpiration, TriggerMechanicMixin) {
  /** @inheritDoc */
  static metadata = mergeMetadata(super.metadata, { type: "trigger" });

  /** @inheritDoc */
  get _formPaths() {
    return [...super._formPaths, ...this._triggerPaths];
  }

  /**
   * Only applicable effects expire from triggers.
   * @inheritDoc
   */
  get documentAllowsTrigger() {
    return super.documentAllowsTrigger && Boolean(this.actor?.applicables.includes(this.getNearestDocument()));
  }

  /** @inheritDoc */
  async _onFire(scope) {
    const effect = this.getNearestDocument();
    const activation = this.attempt(this.type, scope);
    if (!activation || !this.actor) { return; }
    const key = `expiration:${effect.uuid}`;
    scope.chatDataBySource[key] ??= this.actor.prepareTriggeredChatData(
      this.getTriggerLabel(scope),
      effect,
      "expiration",
    );
    scope.chatDataBySource[key].system.activations.push(activation);
  }

  /** @inheritDoc */
  getTriggerLabel(context) {
    return context.trigger ?? super.getTriggerLabel(context);
  }
}

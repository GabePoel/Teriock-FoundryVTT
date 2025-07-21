import ActionHandler from "../action-handler.mjs";

/**
 * Action to apply an effect.
 */
export class ApplyEffectHandler extends ActionHandler {
  /** @inheritDoc */
  static ACTION = "apply-effect";

  _toObj() {
    try {
      return JSON.parse(this.dataset.data);
    } catch (e) {
      ui.notifications.error("Failed to parse effect data.");
      return null;
    }
  }

  /** @inheritDoc */
  async primaryAction() {
    let effectObj = this._toObj(this.dataset.data);
    for (const actor of this.actors) {
      await actor.createEmbeddedDocuments("ActiveEffect", [effectObj]);
      ui.notifications.info(`Applied ${effectObj.name}`);
    }
  }

  /** @inheritDoc */
  async secondaryAction() {
    let effectObj = this._toObj(this.dataset.data);
    for (const actor of this.actors) {
      const foundEffects = actor.effects.filter((effect) => effect.name === effectObj.name);
      const foundIds = foundEffects.map((effect) => effect.id);
      if (foundIds.length > 0) {
        await actor.deleteEmbeddedDocuments("ActiveEffect", foundIds);
        ui.notifications.info(`Removed ${effectObj.name}`);
      } else {
        ui.notifications.warn(`${effectObj.name} not found`);
      }
    }
  }
}

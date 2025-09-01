import ActionHandler from "../action-handler.mjs";

/**
 * Action to use an ability.
 */
export class UseAbilityHandler extends ActionHandler {
  /** @inheritDoc */
  static ACTION = "use-ability";

  /** @inheritDoc */
  async primaryAction() {
    for (const actor of this.actors) {
      await actor.useAbility(this.dataset.ability, this.commonRollOptions);
    }
  }
}

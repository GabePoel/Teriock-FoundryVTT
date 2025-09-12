import ActionHandler from "../action-handler.mjs";

export class DeathBagHandler extends ActionHandler {
  /** @inheritDoc */
  static ACTION = "death-bag";

  /** @inheritDoc */
  async primaryAction() {
    for (const actor of this.actors) {
      await actor.system.deathBagPull();
    }
  }
}
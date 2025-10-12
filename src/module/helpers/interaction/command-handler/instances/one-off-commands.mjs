import CommandHandler from "../command-handler.mjs";

export class AwakenCommand extends CommandHandler {
  /** @inheritDoc */
  static COMMAND = "awaken";

  /** @inheritDoc */
  async execute() {
    for (const actor of this.actors) {
      await actor.system.takeAwaken();
    }
  }
}

export class ReviveCommand extends CommandHandler {
  static COMMAND = "revive";

  /** @inheritDoc */
  async execute() {
    for (const actor of this.actors) {
      await actor.system.takeRevive();
    }
  }
}

export class HealCommand extends CommandHandler {
  /** @inheritDoc */
  static COMMAND = "heal";

  /** @inheritDoc */
  async execute() {
    for (const actor of this.actors) {
      await actor.system.takeNormalHeal();
    }
  }
}

export class RevitalizeCommand extends CommandHandler {
  /** @inheritDoc */
  static COMMAND = "revitalize";

  /** @inheritDoc */
  async execute() {
    for (const actor of this.actors) {
      await actor.system.takeNormalRevitalize();
    }
  }
}

import CommandHandler from "../command-handler.mjs";

export class UseAbilityCommand extends CommandHandler {
  /** @inheritDoc */
  static COMMAND = "use";

  get ability() {
    return this.expression;
  }

  /** @inheritDoc */
  async execute() {
    for (const actor of this.actors) {
      await actor.useAbility(this.ability, {
        advantage: this.advantage,
        disadvantage: this.disadvantage,
      });
    }
  }
}

export class AttackCommand extends UseAbilityCommand {
  /** @inheritDoc */
  static COMMAND = "attack";

  get ability() {
    return "Basic Attack";
  }
}

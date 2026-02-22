import awakenCommand from "../commands/awaken-command.mjs";
import bagCommand from "../commands/bag-command.mjs";
import featCommand from "../commands/feat-command.mjs";
import { hackCommand, unhackCommand } from "../commands/hack-command.mjs";
import healCommand from "../commands/heal-command.mjs";
import resistCommand from "../commands/resist-command.mjs";
import revitalizeCommand from "../commands/revitalize-command.mjs";
import reviveCommand from "../commands/revive-command.mjs";
import standardDamageCommand from "../commands/standard-damage-command.mjs";
import {
  applyStatusCommand,
  removeStatusCommand,
  toggleStatusCommand,
} from "../commands/status-commands.mjs";
import tradecraftCommand from "../commands/tradecraft-command.mjs";
import useAbilityCommand from "../commands/use-ability-command.mjs";
import { CommandButtonHandlerBuilder } from "../interaction-tools.mjs";

/**
 * Action to trigger awaken.
 */
export class AwakenHandler extends CommandButtonHandlerBuilder(awakenCommand) {}

/**
 * Action to trigger revival.
 */
export class ReviveHandler extends CommandButtonHandlerBuilder(reviveCommand) {}

/**
 * Action to trigger healing.
 */
export class HealHandler extends CommandButtonHandlerBuilder(healCommand) {
  /**
   * @inheritDoc
   * @param {Partial<Teriock.Dialog.HealDialogOptions>} [options]
   */
  static buildButton(options = {}) {
    return super.buildButton(options);
  }
}

/**
 * Action to trigger revitalizing.
 */
export class RevitalizeHandler extends CommandButtonHandlerBuilder(
  revitalizeCommand,
) {
  /**
   * @inheritDoc
   * @param {Partial<Teriock.Dialog.StatDialogOptions>} [options]
   */
  static buildButton(options = {}) {
    return super.buildButton(options);
  }
}

/**
 * Action to trigger pulling from the death bag.
 */
export class DeathBagHandler extends CommandButtonHandlerBuilder(bagCommand) {}
/**
 * Action to use an ability.
 */
export class StandardDamageHandler extends CommandButtonHandlerBuilder(
  standardDamageCommand,
) {
  constructor(...args) {
    super(...args);
    this.actors = this.selectedActors;
  }
}

/**
 * Action to take a hack.
 */
export class TakeHackHandler extends CommandButtonHandlerBuilder(hackCommand) {
  /**
   * @inheritDoc
   * @param {Teriock.Parameters.Actor.HackableBodyPart} part
   */
  static buildButton(part) {
    return super.buildButton({ part });
  }
}

/**
 * Action to heal a hack.
 */
export class TakeUnhackHandler extends CommandButtonHandlerBuilder(
  unhackCommand,
) {
  /**
   * @inheritDoc
   * @param {Teriock.Parameters.Actor.HackableBodyPart} part
   */
  static buildButton(part) {
    return super.buildButton({ part });
  }
}
/**
 * Action to use an ability.
 */
export class UseAbilityHandler extends CommandButtonHandlerBuilder(
  useAbilityCommand,
) {
  /**
   * @inheritDoc
   * @param {string} ability
   */
  static buildButton(ability) {
    return super.buildButton({ ability });
  }
}
/**
 * Action to trigger a tradecraft check roll.
 */
export class TradecraftCheckHandler extends CommandButtonHandlerBuilder(
  tradecraftCommand,
) {
  /**
   * @inheritDoc
   * @param {Teriock.Parameters.Fluency.Tradecraft} tradecraft
   * @param {object} [options]
   * @param {number} [options.threshold]
   * @param {number|string} [options.bonus]
   */
  static buildButton(tradecraft, { threshold, bonus }) {
    const button = super.buildButton({ bonus, threshold, tradecraft });
    button.label = button.label.replace("Check", "").trim();
    return button;
  }
}

/**
 * Action to apply a condition.
 */
export class ApplyStatusHandler extends CommandButtonHandlerBuilder(
  applyStatusCommand,
) {
  /**
   * @inheritDoc
   * @param {Teriock.Parameters.Condition.ConditionKey} status
   */
  static buildButton(status) {
    return super.buildButton({ status });
  }
}

/**
 * Action to remove a condition.
 */
export class RemoveStatusHandler extends CommandButtonHandlerBuilder(
  removeStatusCommand,
) {
  /**
   * @inheritDoc
   * @param {Teriock.Parameters.Condition.ConditionKey} status
   */
  static buildButton(status) {
    return super.buildButton({ status });
  }
}

/**
 * Action to toggle a condition.
 */
export class ToggleStatusHandler extends CommandButtonHandlerBuilder(
  toggleStatusCommand,
) {
  /**
   * @inheritDoc
   * @param {Teriock.Parameters.Condition.ConditionKey} status
   */
  static buildButton(status) {
    return super.buildButton({ status });
  }
}

/**
 * Action to trigger a resistance roll.
 */
export class ResistHandler extends CommandButtonHandlerBuilder(resistCommand) {
  /**
   * @inheritDoc
   * @param {object} [options]
   * @param {boolean} [options.hex]
   * @param {number|string} [options.bonus]
   */
  static buildButton({ bonus, hex }) {
    return super.buildButton({ bonus, hex });
  }
}

/**
 * Action to trigger a feat save roll.
 */
export class FeatHandler extends CommandButtonHandlerBuilder(featCommand) {
  /**
   * @inheritDoc
   * @param {Teriock.Parameters.Actor.Attribute} attribute
   * @param {object} [options]
   * @param {number|string} [options.bonus]
   * @param {number} [options.threshold]
   */
  static buildButton(attribute, { bonus, threshold }) {
    return super.buildButton({ attribute, bonus, threshold });
  }
}

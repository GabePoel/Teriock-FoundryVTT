import {
  attuneCommand,
  deattuneCommand,
} from "../commands/attunable-commands.mjs";
import awakenCommand from "../commands/awaken-command.mjs";
import bagCommand from "../commands/bag-command.mjs";
import {
  dampenCommand,
  destroyCommand,
  glueCommand,
  identifyCommand,
  readMagicCommand,
  reforgeCommand,
  repairCommand,
  shatterCommand,
  undampenCommand,
  unglueCommand,
} from "../commands/equipment-commands.mjs";
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
import UseLocalCommand from "../commands/use-local-command.mjs";
import { CommandButtonHandlerBuilder } from "../interaction-tools.mjs";

/**
 * Handler to trigger awaken.
 */
export class AwakenHandler extends CommandButtonHandlerBuilder(awakenCommand) {}

/**
 * Handler to trigger revival.
 */
export class ReviveHandler extends CommandButtonHandlerBuilder(reviveCommand) {}

/**
 * Handler to trigger shatter.
 */
export class ShatterHandler extends CommandButtonHandlerBuilder(
  shatterCommand,
) {}

/**
 * Handler to trigger repair.
 */
export class RepairHandler extends CommandButtonHandlerBuilder(repairCommand) {}

/**
 * Handler to trigger destroy.
 */
export class DestroyHandler extends CommandButtonHandlerBuilder(
  destroyCommand,
) {}

/**
 * Handler to trigger reforge.
 */
export class ReforgeHandler extends CommandButtonHandlerBuilder(
  reforgeCommand,
) {}

/**
 * Handler to trigger glue.
 */
export class GlueHandler extends CommandButtonHandlerBuilder(glueCommand) {}

/**
 * Handler to trigger unglue.
 */
export class UnglueHandler extends CommandButtonHandlerBuilder(unglueCommand) {}

/**
 * Handler to trigger dampen.
 */
export class DampenHandler extends CommandButtonHandlerBuilder(dampenCommand) {}

/**
 * Handler to trigger undampen.
 */
export class UndampenHandler extends CommandButtonHandlerBuilder(
  undampenCommand,
) {}

/**
 * Handler to trigger identify.
 */
export class IdentifyHandler extends CommandButtonHandlerBuilder(
  identifyCommand,
) {}

/**
 * Handler to trigger read magic.
 */
export class ReadMagicHandler extends CommandButtonHandlerBuilder(
  readMagicCommand,
) {}

/**
 * Handler to trigger attune.
 */
export class AttuneHandler extends CommandButtonHandlerBuilder(attuneCommand) {}

/**
 * Handler to trigger deattune.
 */
export class DeattuneHandler extends CommandButtonHandlerBuilder(
  deattuneCommand,
) {}

/**
 * Handler to trigger healing.
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
 * Handler to trigger revitalizing.
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
 * Handler to trigger pulling from the death bag.
 */
export class DeathBagHandler extends CommandButtonHandlerBuilder(bagCommand) {}
/**
 * Handler to use an ability.
 */
export class StandardDamageHandler extends CommandButtonHandlerBuilder(
  standardDamageCommand,
) {
  constructor(...args) {
    super(...args);
    this.actors = this.selectedActors;
  }

  /**
   * @param {Teriock.Interaction.StandardDamageOptions} options
   * @returns {Teriock.UI.HTMLButtonConfig}
   */
  static buildButton(options = {}) {
    return super.buildButton(options);
  }
}

/**
 * Handler to take a hack.
 */
export class TakeHackHandler extends CommandButtonHandlerBuilder(hackCommand) {
  /**
   * @inheritDoc
   * @param {Teriock.Keys.HackableBodyPart} part
   */
  static buildButton(part) {
    return super.buildButton({ part });
  }
}

/**
 * Handler to heal a hack.
 */
export class TakeUnhackHandler extends CommandButtonHandlerBuilder(
  unhackCommand,
) {
  /**
   * @inheritDoc
   * @param {Teriock.Keys.HackableBodyPart} part
   */
  static buildButton(part) {
    return super.buildButton({ part });
  }
}

export class UseLocalHandler extends CommandButtonHandlerBuilder(
  UseLocalCommand,
) {
  /**
   * @inheritDoc
   * @param {string} lookup
   * @param {Teriock.Documents.ChildType} [type]
   */
  static buildButton(lookup, type) {
    return super.buildButton({ lookup, type });
  }
}

/**
 * Handler to trigger a tradecraft check roll.
 */
export class TradecraftCheckHandler extends CommandButtonHandlerBuilder(
  tradecraftCommand,
) {
  /**
   * @inheritDoc
   * @param {Teriock.Keys.Tradecraft} tradecraft
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
 * Handler to apply a condition or other status.
 */
export class ApplyStatusHandler extends CommandButtonHandlerBuilder(
  applyStatusCommand,
) {
  /**
   * @inheritDoc
   * @param {Teriock.Keys.Status} status
   */
  static buildButton(status) {
    return super.buildButton({ status });
  }
}

/**
 * Handler to remove a condition or other status.
 */
export class RemoveStatusHandler extends CommandButtonHandlerBuilder(
  removeStatusCommand,
) {
  /**
   * @inheritDoc
   * @param {Teriock.Keys.Status} status
   */
  static buildButton(status) {
    return super.buildButton({ status });
  }
}

/**
 * Handler to toggle a condition or other status.
 */
export class ToggleStatusHandler extends CommandButtonHandlerBuilder(
  toggleStatusCommand,
) {
  /**
   * @inheritDoc
   * @param {Teriock.Keys.Status} status
   */
  static buildButton(status) {
    return super.buildButton({ status });
  }
}

/**
 * Handler to trigger a resistance roll.
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
 * Handler to trigger a feat save roll.
 */
export class FeatHandler extends CommandButtonHandlerBuilder(featCommand) {
  /**
   * @inheritDoc
   * @param {Teriock.Keys.Attribute} attribute
   * @param {object} [options]
   * @param {number|string} [options.bonus]
   * @param {number} [options.threshold]
   */
  static buildButton(attribute, { bonus, threshold }) {
    return super.buildButton({ attribute, bonus, threshold });
  }
}

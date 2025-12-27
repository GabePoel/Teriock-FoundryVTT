import commands from "../commands/_module.mjs";
import { CommandButtonHandlerBuilder } from "../interaction-tools.mjs";

/**
 * Action to trigger awaken.
 */
export class AwakenHandler extends CommandButtonHandlerBuilder(
  commands.awaken,
) {}

/**
 * Action to trigger revival.
 */
export class ReviveHandler extends CommandButtonHandlerBuilder(
  commands.revive,
) {}

/**
 * Action to trigger healing.
 */
export class HealHandler extends CommandButtonHandlerBuilder(commands.heal) {}

/**
 * Action to trigger revitalizing.
 */
export class RevitalizeHandler extends CommandButtonHandlerBuilder(
  commands.revitalize,
) {}

/**
 * Action to trigger pulling from the death bag.
 */
export class DeathBagHandler extends CommandButtonHandlerBuilder(
  commands.bag,
) {}

import {
  attuneCommand,
  deattuneCommand,
} from "../../../helpers/interaction/commands/attunable-commands.mjs";
import awakenCommand from "../../../helpers/interaction/commands/awaken-command.mjs";
import bagCommand from "../../../helpers/interaction/commands/bag-command.mjs";
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
} from "../../../helpers/interaction/commands/equipment-commands.mjs";
import featCommand from "../../../helpers/interaction/commands/feat-command.mjs";
import {
  hackCommand,
  unhackCommand,
} from "../../../helpers/interaction/commands/hack-command.mjs";
import healCommand from "../../../helpers/interaction/commands/heal-command.mjs";
import resistCommand from "../../../helpers/interaction/commands/resist-command.mjs";
import revitalizeCommand from "../../../helpers/interaction/commands/revitalize-command.mjs";
import reviveCommand from "../../../helpers/interaction/commands/revive-command.mjs";
import standardDamageCommand from "../../../helpers/interaction/commands/standard-damage-command.mjs";
import {
  applyStatusCommand,
  removeStatusCommand,
  toggleStatusCommand,
} from "../../../helpers/interaction/commands/status-commands.mjs";
import tradecraftCommand from "../../../helpers/interaction/commands/tradecraft-command.mjs";
import {
  useExternalCommand,
  useLocalCommand,
} from "../../../helpers/interaction/commands/use-commands.mjs";
import { CommandActivationFactory as Act } from "./abstract/_module.mjs";

export class ApplyStatusActivation extends Act(applyStatusCommand) {}
export class AttuneActivation extends Act(attuneCommand) {}
export class AwakenActivation extends Act(awakenCommand) {}
export class DampenActivation extends Act(dampenCommand) {}
export class DeathBagActivation extends Act(bagCommand) {}
export class DeattuneActivation extends Act(deattuneCommand) {}
export class DestroyActivation extends Act(destroyCommand) {}
export class FeatActivation extends Act(featCommand) {}
export class GlueActivation extends Act(glueCommand) {}
export class HealActivation extends Act(healCommand) {}
export class IdentifyActivation extends Act(identifyCommand) {}
export class ReadMagicActivation extends Act(readMagicCommand) {}
export class ReforgeActivation extends Act(reforgeCommand) {}
export class RemoveStatusActivation extends Act(removeStatusCommand) {}
export class RepairActivation extends Act(repairCommand) {}
export class ResistActivation extends Act(resistCommand) {}
export class RevitalizeActivation extends Act(revitalizeCommand) {}
export class ReviveActivation extends Act(reviveCommand) {}
export class ShatterActivation extends Act(shatterCommand) {}
export class StandardDamageActivation extends Act(standardDamageCommand) {}
export class TakeHackActivation extends Act(hackCommand) {}
export class TakeUnhackActivation extends Act(unhackCommand) {}
export class ToggleStatusActivation extends Act(toggleStatusCommand) {}
export class TradecraftActivation extends Act(tradecraftCommand) {}
export class UndampenActivation extends Act(undampenCommand) {}
export class UnglueActivation extends Act(unglueCommand) {}
export class UseExternalActivation extends Act(useExternalCommand) {}
export class UseLocalActivation extends Act(useLocalCommand) {}

import { DeathBagCommand } from "./instances/death-bag-commands.mjs";
import { FeatSaveCommand } from "./instances/feat-save-commands.mjs";
import { HackCommand, UnhackCommand } from "./instances/hack-commands.mjs";
import { HarmCommand } from "./instances/harm-commands.mjs";
import {
  AwakenCommand,
  HealCommand,
  RevitalizeCommand,
  ReviveCommand,
} from "./instances/one-off-commands.mjs";
import {
  ImmuneCommand,
  ResistCommand,
} from "./instances/protection-commands.mjs";
import { RollableTakesCommand } from "./instances/rollable-takes-commands.mjs";
import { StandardDamageCommand } from "./instances/standard-damage-commands.mjs";
import { TradecraftCommand } from "./instances/tradecraft-commands.mjs";
import {
  AttackCommand,
  UseAbilityCommand,
} from "./instances/use-ability-commands.mjs";

/** @type {typeof CommandHandler[]} */
const commandArray = [
  AttackCommand,
  AwakenCommand,
  DeathBagCommand,
  FeatSaveCommand,
  HackCommand,
  HarmCommand,
  HealCommand,
  ImmuneCommand,
  ResistCommand,
  RevitalizeCommand,
  ReviveCommand,
  RollableTakesCommand,
  StandardDamageCommand,
  TradecraftCommand,
  UnhackCommand,
  UseAbilityCommand,
];

/** @type {Record<string, typeof CommandHandler>} */
const commands = {};
for (const command of commandArray) {
  commands[command.COMMAND] = command;
}

export default commands;

import attackCommand from "./attack-command.mjs";
import awakenCommand from "./awaken-command.mjs";
import bagCommand from "./bag-command.mjs";
import featCommand from "./feat-command.mjs";
import { hackCommand, unhackCommand } from "./hack-command.mjs";
import healCommand from "./heal-command.mjs";
import resistCommand from "./resist-command.mjs";
import revitalizeCommand from "./revitalize-command.mjs";
import reviveCommand from "./revive-command.mjs";
import rollableTakeCommands from "./rollable-take-commands.mjs";
import standardDamageCommand from "./standard-damage-command.mjs";
import {
  applyStatusCommand,
  removeStatusCommand,
  toggleStatusCommand,
} from "./status-commands.mjs";
import tradecraftCommand from "./tradecraft-command.mjs";
import useAbilityCommand from "./use-ability-command.mjs";

const commandArray = [
  ...rollableTakeCommands,
  applyStatusCommand,
  attackCommand,
  awakenCommand,
  bagCommand,
  featCommand,
  hackCommand,
  healCommand,
  removeStatusCommand,
  resistCommand,
  revitalizeCommand,
  reviveCommand,
  standardDamageCommand,
  toggleStatusCommand,
  tradecraftCommand,
  unhackCommand,
  useAbilityCommand,
];

/** @type {Record<string, Teriock.Interaction.CommandEntry>} */
const commands = {};

for (const entry of commandArray) {
  commands[entry.id] = entry;
  if (entry.aliases) {
    for (const alias of entry.aliases) {
      commands[alias] = entry;
    }
  }
}

export default commands;

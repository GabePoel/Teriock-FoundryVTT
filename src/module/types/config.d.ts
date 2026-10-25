import { DatabaseWriteOperation } from "@common/abstract/_types.mjs";

import changeConfig from "../static/config/change-config.mjs";
import tipConfig from "../static/config/tip-config.mjs";

declare global {
  namespace Teriock.Config {
    // Tip Keys
    export type SuppressionMessageKey = keyof typeof tipConfig.suppression;
    export type ErrorMessageKey = keyof typeof tipConfig.error;

    export type ChildChangeTargetEntry = {
      label: string;
      /** The child document subtypes that this applies to. */
      types: Teriock.Documents.ChildType[];
    };

    export type ChildChangePathEntry = {
      forExecution?: boolean;
      group: keyof typeof changeConfig.child.groups;
      label: string;
      targets: (keyof typeof changeConfig.child.targets)[];
      types?: string[];
    };

    export type CategoryEntry = {
      format?: string;
      imgCategory?: string;
      label: string;
      suggestions: string | "none" | "registry";
    };

    export type CurrencyEntry = { conversion: number, label: string, weight: number };

    export type StatEntry = {
      abbreviation: string;
      bar?: { class: string, initial: number, lockInputs?: boolean, max?: number, min?: number, temp?: boolean };
      color?: { base: string, dark: string, darkest: string, light: string };
      costIdentifier: TypedIdentifier;
      /** DSN flavor key */
      die?: string;
      hacks?: boolean;
      icon: string;
      command: Teriock.Keys.Command;
      label: string;
      morganti?: boolean;
      multiplier: number;
      /** Stat pool configuration */
      pool?: {
        enabled: boolean;
        icons: { disabled: string, enabled: string };
        img: string;
        panel: { name: string, text: string };
      };
      /** DSN appearance options */
      style?: { colorset: string };
      transformationReset?: { initial: boolean, update: Record<string, unknown> };
    };

    export type SimpleEntry = { img?: string, label: string };

    type CommandOperation = (
      actor: TeriockActor,
      options: object,
    ) => DatabaseWriteOperation[] | Promise<DatabaseWriteOperation[]>;

    export type CommandNumericEntry = {
      /** Localization string for dealing this */
      deal: string;
      /** Whether to hide this from lists of numeric commands */
      hidden?: boolean;
      /** Whether this is an integer */
      integer?: boolean;
      /** A minimum value allowed for this */
      min?: number;
      /** Whether to show a morganti checkbox */
      morganti?: boolean;
      /** Whether a blank amount should default to `null` instead of `0` */
      nullable?: boolean;
      /** Localization string for taking this */
      take: string;
      /** Localization string for taking a specific `{amount}` of this or a function of the options */
      tooltip: ((options: { amount: number }) => string) | string;
    };

    export type CommandEntry = {
      /** Alternate strings that can be used to invoke this command */
      aliases?: string[];
      /** Explicit arguments that are always assumed to be passed along when this is run in chat (order matters) */
      args?: string[];
      /** Whether this should be bunched with other common commands in one Automation */
      common?: boolean;
      /** Icon that represents this command */
      icon: ((options: object) => string) | string;
      /** Localization string handling for the label of this command */
      label: ((options: object) => string) | string;
      /** Whether this command can run without an Actor */
      noActor?: boolean;
      /** Takes an amount from a formula and deals it from a roll unless applied */
      numeric?: CommandNumericEntry;
      /** Write operations for one Actor */
      operations?: CommandOperation;
      /** The command to take instead or the operations that reverse this one */
      reverse?: string | CommandOperation;
      /** Fire a trigger named after this command before taking it */
      trigger?: boolean;
      /** Run on all Actors at once instead of batching operations */
      execute?: (actors: TeriockActor[], options: object) => Promise<false | void>;
    };

    export type HackEntry = {
      icon: string;
      label: string;
      max: number;
      part: string;
      remove: string;
      statuses: string[];
    };

    export type SizeEntry = {
      /** ID for this size category */
      category: string;
      /** Number of tiles wide this size category is on the battlefield */
      length: number;
      /** Maximum size corresponding to this category */
      max: number;
      /** Number of feet this size category can reach for mêlée attacks */
      reach: number;
    };

    export type TargetEntry = { label: string, targetsActor?: boolean, targetsArmament?: boolean };

    export type InteractionEntry = { identifier: TypedIdentifier, label: string, results: Record<string, string> };

    export type ExecutionTimeEntry = { actions?: number, label: string, reactions?: number };

    export type ManeuverEntry = {
      executionTimes: Record<string, ExecutionTimeEntry>;
      identifier: TypedIdentifier;
      label: string;
    };

    export type DeliveryEntry = {
      allowPiercing?: boolean;
      aoe?: boolean;
      contact?: boolean;
      identifier: TypedIdentifier;
      label: string;
      needsItem?: boolean;
      ranged?: boolean;
      sizes?: string;
      template?: string;
    };

    export type ExpansionEntry = DeliveryEntry & { needsSaveAttribute?: boolean };

    export type KindEntry = { color: string, icon: string, label: string };

    export type PseudoDocumentEntry<TPseudo> = {
      dataModels: Record<string, TPseudo>;
      typeHints: Record<string, string>;
      typeIcons: Record<string, string>;
      typeLabels: Record<string, string>;
    };
  }
}

export {};

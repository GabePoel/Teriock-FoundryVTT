import { TeriockActor } from "../documents/_module.mjs";

declare global {
  export namespace Teriock.Config {
    export type ChildChangeTargetEntry = {
      label: string;
      /** The child document subtypes that this applies to. */
      types: Teriock.Documents.ChildType[];
    };

    export type ChildChangePathEntry = {
      targets: (keyof typeof TERIOCK.config.change.child.targets)[];
      forExecution?: boolean;
      group: keyof typeof TERIOCK.config.change.child.groups;
      label: string;
      types?: Teriock.Changes.Type[];
    };

    export type CurrencyEntry = {
      abbreviation: string;
      label: string;
      value: number;
      weight: number;
    };

    export type DocumentEntry = {
      documentName: CommonDocumentName | "Card" | "JournalEntryPage";
      getter: string;
      icon: string;
      index: string;
      label: string;
      pack: string;
      plural: string;
      sorter: (doc: AnyCommonDocument[]) => AnyCommonDocument[];
    };

    export type ImpactEntry = {
      aliases?: string[];
      apply: (actor: TeriockActor, amt: number) => Promise<void>;
      deal: string;
      icon: string;
      label: string;
      morganti?: boolean;
      reverse: (actor: TeriockActor, amt: number, options: object) => Promise<void>;
      take: string;
      nullable?: boolean;
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
      /** Maximum size corresponding to this category */
      max: number;
      /** Number of tiles wide this size category is on the battlefield */
      length: number;
      /** ID for this size category */
      category: string;
      /** Number of feet this size category can reach for mêlée attacks */
      reach: number;
    };

    export type SubtypeEntry = {
      label: string;
      icon: string;
      color: string;
    };
  }
}

export {};

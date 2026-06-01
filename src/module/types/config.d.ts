import { TeriockActor } from "../documents/_module.mjs";

declare global {
  export namespace Teriock.Config {
    export type ChildChangeTargetEntry = {
      label: string;
      /** The child document subtypes that this applies to. */
      types: Teriock.Documents.ChildType[];
    };

    export type ChildChangePathEntry = {
      forExecution?: boolean;
      group: keyof typeof TERIOCK.config.change.child.groups;
      label: string;
      targets: (keyof typeof TERIOCK.config.change.child.targets)[];
      types?: Teriock.Changes.Type[];
    };

    export type CurrencyEntry = { conversion: number, label: string, weight: number };

    export type WikiNamespaceEntry = {
      collection?: string;
      icon: string;
      identifierType?: string;
      index?: keyof typeof TERIOCK.index;
      packs: string[];
      parentKey: string;
      type: string;
    };

    export type DocumentEntry = {
      documentName: "Card" | "JournalEntryPage" | CommonDocumentName;
      getter: string;
      hint: string;
      icon: string;
      index: string;
      label: string;
      pack: string;
      plural: string;
      sorter: (doc: AnyCommonDocument[]) => AnyCommonDocument[];
    };

    export type ImpactEntry = {
      aliases?: string[];
      deal: string;
      icon: string;
      label: string;
      morganti?: boolean;
      nullable?: boolean;
      take: string;
      apply: (actor: TeriockActor, amt: number) => Promise<void>;
      reverse: (actor: TeriockActor, amt: number, options: object) => Promise<void>;
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

    export type SubtypeEntry = { color: string, icon: string, label: string };
  }
}

export {};

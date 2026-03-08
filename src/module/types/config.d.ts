declare global {
  export namespace Teriock.Config {
    export type HackConfig = {
      icon: string;
      label: string;
      max: number;
      remove: string;
    };

    export type DocumentConfig = {
      doc: CommonDocumentName | "Card" | "JournalEntryPage";
      getter: string;
      icon: string;
      index: string;
      name: string;
      pack: string;
      plural: string;
      sorter: (doc: AnyCommonDocument[]) => AnyCommonDocument[];
    };

    export type SizeConfig = {
      /** Maximum size corresponding to this category */
      max: number;
      /** Number of tiles wide this size category is on the battlefield */
      length: number;
      /** ID for this size category */
      category: string;
      /** Number of feet this size category can reach for melee attacks */
      reach: number;
    };
  }
}

export {};

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
  }
}

export {};

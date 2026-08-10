declare global {
  namespace Teriock.Sort {
    export type DocumentSorter = (a: TeriockDocument, b: TeriockDocument) => number;

    export type DocumentSorterEntry = { label: string, sorter: DocumentSorter };
  }
}

export {};

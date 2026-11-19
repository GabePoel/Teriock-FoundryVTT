declare global {
  namespace Teriock.ElderSorcery {
    export type ElementWords = Partial<Record<Teriock.Keys.PartOfSpeech, Record<number, Set<string>>>>;

    export interface Entry {
      element: Teriock.Keys.Element;
      op: number;
      part: Teriock.Keys.PartOfSpeech;
      word: string;
    }

    export interface Filter {
      elements?: Iterable<Teriock.Keys.Element> | Teriock.Keys.Element | null;
      ops?: number | Iterable<number> | null;
      parts?: Iterable<Teriock.Keys.PartOfSpeech> | Teriock.Keys.PartOfSpeech | null;
    }
  }
}

export {};

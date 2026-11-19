// TODO: Move this into an `elder-sorcery.d.ts` file.
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

declare module "./elder-sorcery-table.mjs" {
  export default interface ElderSorceryTable extends Record<Teriock.Keys.Element, Teriock.ElderSorcery.ElementWords> {}
}

export {};

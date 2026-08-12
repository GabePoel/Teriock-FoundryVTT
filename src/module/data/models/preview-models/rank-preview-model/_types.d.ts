declare module "./rank-preview-model.mjs" {
  export default interface RankPreviewModel {
    filters: Teriock.Models.BaseFilters & {
      archetype: Teriock.Keys.Archetype | null;
      class: Teriock.Keys.Class | null;
      kind: Teriock.Keys.RankKind | null;
    };
  }
}

export {};

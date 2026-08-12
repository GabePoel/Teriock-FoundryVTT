declare module "./power-preview-model.mjs" {
  export default interface PowerPreviewModel {
    filters: Teriock.Models.BaseFilters & { kind: Teriock.Keys.PowerKind | null };
  }
}

export {};

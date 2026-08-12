declare module "./property-preview-model.mjs" {
  export default interface PropertyPreviewModel {
    filters: Teriock.Models.MetaphysicsFilters & {
      applyIfDampened: boolean | null;
      applyIfDeattuned: boolean | null;
      applyIfShattered: boolean | null;
      applyIfUnequipped: boolean | null;
      consumable: boolean | null;
    };
  }
}

export {};

declare module "./fluency-preview-model.mjs" {
  export default interface FluencyPreviewModel {
    filters: Teriock.Models.BaseFilters & {
      field: Teriock.Keys.Field | null;
      tradecraft: Teriock.Keys.Tradecraft | null;
    };
  }
}

export {};

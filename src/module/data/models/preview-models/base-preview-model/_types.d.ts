declare module "./base-preview-model.mjs" {
  export default interface BasePreviewModel {
    display: { gapless: boolean, size: Teriock.Keys.CardDisplaySize };
    filters: Teriock.Models.BaseFilters;
    id: string;
    sort: { ascending: boolean, option: string };
    search: string;
    toggles: Teriock.Previews.PreviewToggles;
  }
}

declare global {
  namespace Teriock.Models {
    export type BaseFilters = {
      active: boolean | null;
      children: boolean | null;
      duplicates: boolean | null;
      fluent: boolean | null;
      proficient: boolean | null;
    };
  }
}

export {};

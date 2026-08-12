declare module "./affinity-preview-model.mjs" {
  // @ts-expect-error Filter override
  export default interface AffinityPreviewModel {
    filters: {
      category: Teriock.Keys.AffinityCategory | null;
      protection: boolean | null;
      type: Teriock.Affinities.Type | null;
      weakness: boolean | null;
    };
  }
}

export {};

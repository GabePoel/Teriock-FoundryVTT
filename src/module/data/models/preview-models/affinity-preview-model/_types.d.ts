declare module "./affinity-preview-model.mjs" {
  // @ts-expect-error Filter override
  export default interface AffinityPreviewModel {
    filters: {
      category: Teriock.Keys.AffinityCategory | null;
      protection: boolean | null;
      type: AffinityType | null;
      weakness: boolean | null;
    };
  }
}

export {};

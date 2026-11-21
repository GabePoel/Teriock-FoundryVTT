declare module "./region-automation.mjs" {
  export default interface RegionAutomation {
    applyDocuments: boolean;
    behaviors: object[];
    deleteOnTurnChange: boolean;
    visibility: number;
  }
}

export {};

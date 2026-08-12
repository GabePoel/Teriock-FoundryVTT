declare module "./base-virtual-model.mjs" {
  export default interface BaseVirtualModel {
    img: Teriock.System.ImageString;
    providers: Set<string>;
    sources: Set<UUID<TeriockDocument>>;
  }
}

export {};

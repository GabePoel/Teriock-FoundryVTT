declare module "./common-type-model.mjs" {
  export default // @ts-expect-error Not a duplicate identifier
  class CommonTypeModel {
    get parent(): TeriockCommon;
  }
}

export {};

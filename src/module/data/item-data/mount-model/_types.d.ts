declare module "./mount-model.mjs" {
  export default interface TeriockMountModel {
    /** <schema> Mount species or type */
    mountType: string;
    /** <schema> If mount is mounted */
    mounted: boolean;

    get parent(): TeriockMount;
  }
}

export {};

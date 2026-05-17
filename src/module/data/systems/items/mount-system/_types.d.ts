declare global {
  namespace Teriock.Models {
    export type MountSystemData = {
      /** <schema> If mount is mounted */
      mounted: boolean;
      /** <schema> Mount species or type */
      mountType: string;

      get parent(): TeriockMount;
    };
  }
}

export {};

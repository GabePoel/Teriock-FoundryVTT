declare global {
  namespace Teriock.Models {
    export type MountSystemData = {
      /** <schema> Mount species or type */
      mountType: string;
      /** <schema> If mount is mounted */
      mounted: boolean;

      get parent(): TeriockMount;
    };
  }
}

export {};

declare global {
  namespace Teriock.Models {
    export interface MountSystemInterface
      extends Teriock.Models.BaseItemSystemInterface {
      /** <schema> Mount species or type */
      mountType: string;
      /** <schema> If mount is mounted */
      mounted: boolean;

      get parent(): TeriockMount;
    }
  }
}

export {};

declare global {
  namespace Teriock.Models {
    export interface TeriockMountModelInterface
      extends Teriock.Models.TeriockBaseItemModelInterface {
      /** <schema> Mount species or type */
      mountType: string;
      /** <schema> If mount is mounted */
      mounted: boolean;

      get parent(): TeriockMount;
    }
  }
}

export {};

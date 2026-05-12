declare global {
  namespace Teriock.Models {
    export type BaseSystemData = {
      /** <schema> Generic context-dependent pointer to some other document that this is  sourced from */
      _src: UUID<TeriockDocument> | null;
    };
  }
}

export {};

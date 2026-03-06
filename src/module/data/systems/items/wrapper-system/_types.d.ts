declare global {
  namespace Teriock.Models {
    export type WrapperSystemInterface = {
      get parent(): TeriockWrapper;
    };
  }
}

export {};

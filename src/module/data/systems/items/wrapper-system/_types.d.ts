declare global {
  namespace Teriock.Models {
    export type WrapperSystemData = {
      get parent(): TeriockWrapper;
    };
  }
}

export {};

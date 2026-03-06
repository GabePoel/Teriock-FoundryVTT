declare global {
  namespace Teriock.Models {
    export type ResourceSystemInterface = {
      get parent(): TeriockResource;
    };
  }
}

export {};

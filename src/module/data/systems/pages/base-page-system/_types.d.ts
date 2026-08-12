declare module "./base-page-system.mjs" {
  export default interface BasePageSystem extends Teriock.Models.BasePageSystemData {}
}

declare module "../rule-system.mjs" {
  export default interface RuleSystem extends Teriock.Models.BasePageSystemData {}
}

declare global {
  namespace Teriock.Models {
    export type BasePageSystemData = { img: Teriock.System.ImageString };
  }
}

export {};

declare module "./base-message-system.mjs" {
  export default interface BaseMessageSystem extends Teriock.Models.BaseMessageSystemData {}
}

declare global {
  namespace Teriock.Data {
    export type BaseMessageData = Pick<Teriock.Models.BaseSystemData, "_src">;
  }

  namespace Teriock.Models {
    export type BaseMessageSystemData = Teriock.Models.BaseSystemData & {};
  }
}

export {};

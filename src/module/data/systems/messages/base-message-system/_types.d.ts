import { TeriockChatMessage } from "../../../../documents/_module.mjs";

declare global {
  namespace Teriock.Data {
    export type BaseMessageData = Pick<Teriock.Models.BaseSystemData, "_src">;
  }

  namespace Teriock.Models {
    export type BaseMessageSystemData = Teriock.Models.BaseSystemData & { get parent(): TeriockChatMessage };
  }
}

export {};

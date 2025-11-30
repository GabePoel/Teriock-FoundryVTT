import { TeriockChatMessage } from "../../../documents/_module.mjs";

declare global {
  namespace Teriock.Data {
    export interface BaseMessageData {
      /** <schema> Fallback avatar image to use. */
      avatar: string;
      /** <schema> Buttons to display below the content of the message */
      buttons: Teriock.UI.HTMLButtonConfig[];
      /** <schema> Custom number of columns */
      columns: number;
      /** <schema> Content to be displayed in addition to {@link TeriockRoll} results */
      extraContent: string;
      /** <schema> Elder Sorcery spell circle overlay */
      overlay: string;
      /** <schema> Panels to render */
      panels: Teriock.MessageData.MessagePanel[];
      /** <schema> Document that the message is sourced from */
      source: UUID<TeriockCommon>;
      /** <schema> Strings to be wrapped as tags at the bottom of the message */
      tags: string[];
    }
  }
}

declare module "./base-message-model.mjs" {
  export default interface TeriockBaseMessageModel
    extends Teriock.Data.BaseMessageData {
    get parent(): TeriockChatMessage;
  }
}

export {};

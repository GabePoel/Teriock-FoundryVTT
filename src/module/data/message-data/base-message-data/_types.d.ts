import type { TeriockChatMessage } from "../../../documents/_module.mjs";

declare module "./base-message-data.mjs" {
  export default interface TeriockBaseMessageModel {
    /** <schema> Buttons to display below the content of the message */
    buttons: Teriock.UI.HTMLButtonConfig[];
    /** <schema> Custom number of columns */
    columns: number;
    /** <schema> Content to be displayed in addition to {@link TeriockRoll} results */
    extraContent: string;
    /** <schema> Elder Sorcery spell circle overlay */
    overlay: string;
    /** <schema> Document that the message is sourced from */
    source: Teriock.UUID<TeriockCommon>;
    /** <schema> Strings to be wrapped as tags at the bottom of the message */
    tags: string[];

    get parent(): TeriockChatMessage;
  }
}

declare module "./base-message-model.mjs" {
  export default interface TeriockBaseMessageModel {
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
    source: Teriock.UUID<TeriockCommon>;
    /** <schema> Strings to be wrapped as tags at the bottom of the message */
    tags: string[];
  }
}

export {};

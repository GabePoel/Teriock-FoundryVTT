declare global {
  namespace Teriock.SelectOptions {
    export type DocumentSelect = {
      /** Title for the dialog */
      title?: string;
      /** Text to display on the dialog */
      hint?: string;
      /** Whether a tooltip should be displayed for each document option */
      tooltip?: boolean;
      /** Unique key to use that identifies each document */
      idKey?: string;
      /** Path to an image to display for each document */
      imgKey?: string;
      /** Path to a name to display for each document */
      nameKey?: string;
      /** Path to HTML to use for the tooltip for each document */
      tooltipKey?: string;
    };

    export type DocumentsSelect = Teriock.SelectOptions.DocumentSelect & {
      /** Whether multiple documents can be selected */
      multi?: boolean;
    };
  }
}

export {};

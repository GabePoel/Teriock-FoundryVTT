declare global {
  namespace Teriock.SelectOptions {
    export type DocumentSelect = {
      /** Text to display on the dialog */
      hint?: string;
      /** Unique key to use that identifies each document */
      idKey?: string;
      /** Path to an image to display for each document */
      imgKey?: string;
      /** Path to a name to display for each document */
      nameKey?: string;
      /** Title for the dialog */
      title?: string;
      /** Whether a tooltip should be displayed for each document option */
      tooltip?: boolean;
      /** Path to HTML to use for the tooltip for each document */
      tooltipKey?: string | null;
      /** Whether a tooltip should be asynchronously fetched for each document */
      tooltipAsync?: boolean;
      /** Path to a UUID used for fetching the tooltip */
      tooltipUUID?: string;
      /** Whether document sheets can be opened on double click */
      openable?: boolean;
    };

    export type DocumentsSelect = Teriock.SelectOptions.DocumentSelect & {
      /** Whether multiple documents can be selected */
      multi?: boolean;
    };

    export type SelectDocument = {
      /** Name to display */
      name: string;
      /** Image path */
      img: string;
      /** HTML to include in tooltip */
      tooltip?: string;
      /** UUID used for opening document sheets and fetching tooltips */
      uuid?: string;
      /** Size the image up for dynamic rings */
      rescale?: boolean;
    };

    export type DocumentSelectContext = {
      documents: Record<string, Teriock.SelectOptions.SelectDocument>;
      hint: string;
      tooltip: boolean;
    };
  }
}

export {};

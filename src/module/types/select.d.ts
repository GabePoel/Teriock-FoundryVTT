declare global {
  namespace Teriock.Select {
    export type DocumentSelectionEntry = {
      /** Whether this is checked by default */
      checked?: boolean;
      /** Image path */
      img: string;
      /** Name to display */
      name: string;
      /** Text to display */
      text?: string;
      /** UUID used for opening document sheets and fetching tooltips */
      uuid?: string;
    };

    type _BaseDocumentSelectDialogOptions = {
      /** Text to display on the dialog */
      hint?: string;
      /** Icon class */
      icon?: string;
      /** Path to an image to display for each document */
      imgKey?: string;
      /** Whether to localize title, hint, and warning strings */
      localize?: boolean;
      /** Whether document sheets can be opened on double click */
      openable?: boolean;
      /** Whether to suppress warnings if there's no documents to select from. */
      silent?: boolean;
      /** Path to some extra text to display for each document */
      textKey?: string;
      /** Title for the dialog */
      title?: string;
      /** Whether a tooltip should be displayed for each document option */
      tooltip?: boolean;
    };

    export type SelectDocumentDialogOptions = _BaseDocumentSelectDialogOptions & {
      /** Automatically select the only option if exactly one is provided? */
      auto?: boolean;
      /** Which document is checked? */
      checked?: string;
    };

    export type SelectDocumentsDialogOptions = _BaseDocumentSelectDialogOptions & {
      /** Which documents are checked? */
      checked?: string[];
      /** Whether multiple documents can be selected */
      multi?: boolean;
      /** A custom message to show if there's no documents to select from. */
      noDocumentsMessage?: string;
    };

    export type SelectDialogOptions = {
      /** If true, "Other" returns `null` instead of prompting again. */
      genericOther?: boolean;
      /** Hint text. */
      hint?: string;
      /** Additional hint with more complex HTML. */
      hintHtml?: string;
      /** Title for the additional hint. */
      hintTitle?: string;
      /** Icon to use for the select window. */
      icon?: string;
      /** The initially selected choice. */
      initial?: string | null;
      /** Label for the select field. */
      label?: string;
      /** Whether to include an "Other" button. */
      other?: boolean;
      /** If true, no blank choice will be offered. */
      required?: boolean;
      /** Dialog title. */
      title?: string;
    };
  }
}

export {};

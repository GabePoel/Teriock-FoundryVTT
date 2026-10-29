declare global {
  namespace Teriock.Select {
    export type DocumentSelectionEntry = {
      /** Whether this is checked by default */
      checked?: boolean;
      /** Image path */
      img: string;
      /** Whether this can't be toggled */
      locked?: boolean;
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
      /** Whether to include a "None" button that resolves with `null` in single mode or `[]` if multi */
      nullable?: boolean;
      /** Whether document sheets can be opened on double click */
      openable?: boolean;
      /** Whether to ensure selected documents are resolved to actual documents */
      resolve?: boolean;
      /** Whether to suppress warnings if there's no documents to select from */
      silent?: boolean;
      /** Path to some extra text to display for each document */
      textKey?: string;
      /** Title for the dialog */
      title?: string;
      /** Whether a tooltip should be displayed for each document option */
      tooltip?: boolean;
      /** Called with the event that confirmed the selection */
      onConfirm?: (event: Event) => void;
    };

    export type SelectDocumentDialogOptions = _BaseDocumentSelectDialogOptions & {
      /** Automatically select the only option if exactly one is provided? */
      auto?: boolean;
      /** Which document is checked? */
      checked?: string;
      /** Which document can't be toggled? */
      locked?: string;
    };

    export type SelectDocumentsDialogOptions = _BaseDocumentSelectDialogOptions & {
      /** Which documents are checked? */
      checked?: string[];
      /** Which documents can't be toggled? */
      locked?: string[];
      /** Whether multiple documents can be selected */
      multi?: boolean;
      /** A custom message to show if there's no documents to select from. */
      noDocumentsMessage?: string;
    };

    export type _ChoiceSelectorOptions = {
      /** Additional hint with more complex HTML. */
      hintHtml?: string;
      /** Icon to use for the select window. */
      icon?: string;
      /** Whether to include an "Other" button that resolves with `null`. */
      other?: boolean;
      /** Dialog title. */
      title?: string;
    };

    export type DocumentSelectionConfig = {
      /** Whether all options should automatically be selected */
      all?: boolean;
      /** Whether to automatically provide a document if only one is available */
      auto?: boolean;
      /** Whether to recursively expand folders in finding documents */
      expandFolders?: boolean;
      /** Whether to recursively expand tables in finding documents */
      expandTables?: boolean;
      /** Identifiers to get documents from globally */
      globalIdentifiers?: Iterable<TypedIdentifier>;
      /** IDs for compendium packs to get documents from globally */
      globalPacks?: string[];
      /** Identifier types to get documents from globally */
      globalTypes?: string[];
      /** UUIDs to get documents from globally */
      globalUuids?: Iterable<UUID>;
      /** Identifiers to get documents from relative to the provided document */
      localIdentifiers?: Iterable<TypedIdentifier>;
      /** Qualifier to get documents from relative to the provided document */
      localQualifier?: Teriock.System.FormulaString;
      /** Relative UUIDs to get documents from relative to the provided document */
      localUuids?: Iterable<UUID>;
      /** Whether to allow for multiple documents to be selected */
      multi?: boolean;
      /** A document to find local documents relative to */
      relativeTo?: TeriockActiveEffect | TeriockActor | TeriockItem;
      /** Something every document must satisfy to be selectable */
      filter?: (document: TeriockDocument) => boolean;
    };
  }
}

export {};

import type {
  TeriockActor,
  TeriockEffect,
  TeriockItem,
} from "../../_module.mjs";

export interface CommonDocumentMixinInterface {
  /** The actor associated with this document if there is one */
  get actor(): TeriockActor | null;

  /**
   * Metadata.
   * @returns The document metadata
   */
  get metadata(): Readonly<Teriock.Documents.ModelMetadata>;

  /**
   * A modified version of this document's name that displays additional text if needed.
   * @returns The formatted name string
   */
  get nameString(): string;

  /**
   * The document's UUID.
   * @returns The unique identifier for this document
   */
  get uuid(): Teriock.UUID<TeriockActor | TeriockItem | TeriockEffect>;

  /**
   * Disables the document by setting its disabled property to true.
   * @returns Promise that resolves when the document is disabled
   */
  disable(): Promise<void>;

  /**
   * Enables the document by setting its disabled property to false.
   * @returns Promise that resolves when the document is enabled
   */
  enable(): Promise<void>;

  /**
   * Forces an update of the document by toggling the update counter.
   * This is useful for triggering reactive updates in the UI.
   * @returns Promise that resolves when the document is updated
   */
  forceUpdate(): Promise<void>;

  /**
   * Execute all macros for a given pseudo-hook and call a regular hook with the same name.
   * @param name - The name of the pseudo-hook and hook to call
   * @param args - Arguments to pass to the pseudo-hook macros and the hook
   * @returns Promise that resolves when the hook call is complete
   */
  hookCall(
    name: Teriock.Parameters.Actor.PseudoHook,
    ...args: any[]
  ): Promise<any>;

  /**
   * Toggles the disabled state of the document.
   * @returns Promise that resolves when the disabled state is toggled
   */
  toggleDisabled(): Promise<void>;
}

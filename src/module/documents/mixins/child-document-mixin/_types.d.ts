export interface ChildDocumentMixinInterface {
  /**
   * Builds an enriched message from the document's message parts.
   * @param options - Options for building the message
   * @returns Promise that resolves to the enriched message HTML
   */
  buildMessage(options?: Teriock.MessageData.MessageOptions): Promise<string>;

  /**
   * Builds a raw message string from the document's message parts.
   * @param options - Options for building the message
   * @returns The raw message HTML
   */
  buildRawMessage(options?: Teriock.MessageData.MessageOptions): HTMLDivElement;

  /**
   * Sends a chat message with the document's content.
   * @returns Promise that resolves when the chat message is sent
   */
  chat(): Promise<void>;

  /**
   * Sends a chat message with the document's image.
   * @returns Promise that resolves when the image message is sent
   */
  chatImage(): Promise<void>;

  /**
   * Duplicates the document within its parent.
   * @returns Promise that resolves to the duplicated document
   */
  duplicate(): Promise<ChildDocumentMixinInterface>;

  /**
   * Checks if the document is fluent.
   * @returns True if the document is fluent, false otherwise.
   */
  get isFluent(): boolean;

  /**
   * Checks if the document is proficient.
   * @returns True if the document is proficient, false otherwise.
   */
  get isProficient(): boolean;

  /**
   * Rolls the item, delegating to the system's roll method.
   * @param _options - Options for the roll
   * @returns Promise that resolves when the roll is complete
   */
  roll(_options: object): Promise<void>;

  /**
   * Uses the document, calling hooks and delegating to the system's use method.
   * @param options - Options for using the document
   * @returns Promise that resolves when the use action is complete
   */
  use(options: object): Promise<void>;

  /**
   * Opens the wiki for this document (default implementation calls wikiPull).
   * @returns Promise that resolves when the wiki is opened
   */
  wikiOpen(): Promise<void>;

  /**
   * Attempts to pull content from the wiki (default implementation shows error).
   * @returns Promise that resolves when the wiki pull is complete
   */
  wikiPull(): Promise<void>;
}

export interface WikiDataMixinInterface {
  /**
   * Gets the full wiki page path including namespace.
   * Constructs the wiki page identifier from namespace and parent name.
   * @returns The complete wiki page path with namespace prefix.
   */
  get wikiPage(): string;

  /**
   * Parses raw HTML content from the wiki into document data updates.
   * Converts wiki HTML content into structured data for document updates.
   * @param rawHTML - The raw HTML content fetched from the wiki.
   * @returns Promise that resolves to an object containing data updates.
   */
  parse(rawHTML: string): Promise<object>;

  /**
   * Opens the wiki page in the default browser.
   * Navigates to the wiki page URL for manual viewing and editing.
   */
  wikiOpen(): void;

  /**
   * Pulls data from the wiki and updates the document.
   * Fetches wiki page content, parses it, and applies updates to the document.
   * @param options - Options for the wiki pull operation.
   * @returns Promise that resolves when the wiki pull is complete.
   */
  wikiPull(options?: Teriock.Wiki.PullOptions): Promise<void>;
}

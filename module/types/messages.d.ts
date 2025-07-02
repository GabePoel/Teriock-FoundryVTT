/**
 * Pieces of a bar within a chat message.
 *
 * @property icon - Name of FontAwesome icon to display in the message bar.
 * @property wrappers - Strings to wrap within the message bar.
 */
export type MessageBar = {
  icon: string;
  wrappers: string[];
};

/**
 * Pieces of a block within a chat message.
 *
 * @property title - The title of the message block.
 * @property text - Optional. The main text content of the message block.
 * @property special - Optional. Special information for formatting.
 * @property elements - Optional. Elder Sorcery elements for formatting.
 */
export type MessageBlock = {
  title: string;
  text?: string;
  special?: string;
  elements?: string;
};

/**
 * Represents the individual rules-parts that make up a message.
 *
 * @property image - The URL or path to the image associated with the message.
 * @property name - The name or title to display in the message.
 * @property bars - An array of `MessageBar` objects.
 * @property blocks - An array of `MessageBlock` objects.
 * @property font - Font used for message, or `null` for default font.
 */
export type MessageParts = {
  image?: string;
  name?: string;
  bars?: MessageBar[];
  blocks?: MessageBlock[];
  font?: string | null;
};

/**
 * Options for configuring a message.
 *
 * @property secret - If true, the content of the message is obfuscated.
 */
export type MessageOptions = {
  secret?: boolean;
};

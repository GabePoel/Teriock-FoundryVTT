declare module "./base-chat-button.mjs" {
  export default interface BaseChatButtonInterface {
    /** ID of this button */
    _id: string;
    /** CSS classes */
    classes?: Set<string>;
    /** Button background color */
    color?: string;
    /** Data to use while processing button actions */
    data: object;
    /** Font Awesome icon to display */
    icon: string;
    /** Text to display */
    label: string;
  }
}
export {};
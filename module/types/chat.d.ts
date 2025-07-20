/** Parameters to construct an HTML button. */
export type HTMLButtonConfig = {
  label?: string;
  dataset?: Record<string, string>;
  classes?: string[];
  icon?: string;
  type?: "button";
  disabled?: boolean;
}

/** Parameters that define a chat message button. */
export interface ChatActionButton {
  /** Font Awesome icon class. */
  icon: string;
  /** Action assigned to the button. */
  action: string;
  /** Label to apply to the button. */
  label?: string;
  /** Data to pass along with the button. */
  data?: string;
}

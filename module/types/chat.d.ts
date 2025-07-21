/** Parameters to construct an HTML button. */
export type HTMLButtonConfig = {
  label?: string;
  dataset?: Record<string, string>;
  classes?: string[];
  icon?: string;
  type?: "button";
  disabled?: boolean;
};

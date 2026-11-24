export interface ContentField<T extends object> {
  key: Extract<keyof T, string>;
  label: string;
  kind?: "text" | "multiline" | "url" | "boolean";
  hint?: string;
  /** Shown as "(optional)"; the Yup schema allows it to be empty. */
  optional?: boolean;
}

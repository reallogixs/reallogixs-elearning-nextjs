export interface ContentField<T extends object> {
  key: Extract<keyof T, string>;
  label: string;
  kind?: "text" | "multiline" | "url" | "boolean";
  hint?: string;
}

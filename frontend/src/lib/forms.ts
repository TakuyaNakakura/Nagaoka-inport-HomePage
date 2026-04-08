export type FormFieldType = "text" | "textarea" | "select" | "checkbox" | "multiselect";

export type FormFieldOption = {
  label: string;
  value: string;
};

export type FormField = {
  name: string;
  label: string;
  type: FormFieldType;
  required?: boolean;
  placeholder?: string;
  rows?: number;
  nullable?: boolean;
  options?: FormFieldOption[];
  optionsKey?: "centers" | "companies" | "supportProjects" | "activityReports";
  helpText?: string;
};

export type FormValues = Record<string, string | string[] | boolean>;


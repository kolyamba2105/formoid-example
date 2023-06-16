import { validator } from "formoid";
import { isNonEmptyString, NonEmptyString } from "./refinements";

export function nonEmptyString(message?: string): validator.Validator<string, NonEmptyString> {
  return validator.fromPredicate(isNonEmptyString, message || "This field is required");
}

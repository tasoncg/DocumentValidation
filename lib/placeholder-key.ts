import { nanoid } from "nanoid";

export function newPlaceholderKey() {
  return `pk_${nanoid(10)}`;
}

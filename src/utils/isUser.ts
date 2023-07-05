import { User } from "../types/User";

export function isUser(obj: any): obj is User {
  return "name" in obj && "age" in obj && "hobbies" in obj;
}

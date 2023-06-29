export interface User {
  name: string;
  hobbies: string[] | "";
  age: number;
}

export interface UserServer extends User {
  id: string;
}

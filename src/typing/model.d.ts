export interface User {
  name: string;
  socketId: string;
  isCreator: boolean;
}

export interface Room {
  code: string;
  users: User[];
  turn: number;
  error: string;
  isGameStarted: boolean;
}

import { Server } from 'socket.io';
import { NextApiResponse } from 'next';

interface SocketServer extends Server {
  initialized?: boolean;
}

interface Room {
  users: { socketId: string; name: string; isCreator: boolean }[];
}

const rooms: Record<string, Room> = {};

const generateRoomCode = (): string => {
  let code: string;
  do {
    code = Math.random().toString(36).substr(2, 4).toUpperCase();
  } while (rooms[code]);
  return code;
};

const initializeWebSocket = (res: NextApiResponse) => {
  // Проверяем, что res.socket существует
  const socket = res.socket as any; // Используем явное приведение типа для избежания ошибок
  if (!socket.server.io) {
    console.log('Initializing WebSocket server...');

    const io: SocketServer = new Server(socket.server);

    io.initialized = true;

    socket.server.io = io;

    io.on('connection', (socket) => {
      console.log(`New connection: ${socket.id}`);

      // Создание комнаты
      socket.on('create-room', (userName: string) => {
        const roomCode = generateRoomCode();
        rooms[roomCode] = {
          users: [{ socketId: socket.id, name: userName, isCreator: true }],
        };
        socket.join(roomCode);
        socket.emit('room-created', roomCode);
        io.to(roomCode).emit('update-users', rooms[roomCode].users);
      });

      // Присоединение к комнате
      socket.on('join-room', (roomCode: string, userName: string) => {
        if (rooms[roomCode]) {
          const userExists = rooms[roomCode].users.some((user) => user.name === userName);
          if (userExists) {
            socket.emit('name-taken', 'Name already taken');
            return;
          }

          rooms[roomCode].users.push({
            socketId: socket.id,
            name: userName,
            isCreator: false,
          });
          socket.join(roomCode);
          socket.emit('room-joined', roomCode);
          io.to(roomCode).emit('update-users', rooms[roomCode].users);
        } else {
          socket.emit('room-not-found', 'Room not found');
        }
      });

      // Обновление порядка пользователей
      socket.on('update-user-order', (roomCode: string, newUserOrder: { socketId: string; name: string; isCreator: boolean }[]) => {
        if (rooms[roomCode]) {
          rooms[roomCode].users = newUserOrder;
          io.to(roomCode).emit('update-users', rooms[roomCode].users);
        }
      });

      // Отключение пользователя
      socket.on('disconnect', () => {
        for (const roomCode in rooms) {
          const room = rooms[roomCode];
          const index = room.users.findIndex((user) => user.socketId === socket.id);

          if (index !== -1) {
            const user = room.users[index];
            room.users.splice(index, 1);
            io.to(roomCode).emit('update-users', room.users);

            if (user.isCreator && room.users.length > 0) {
              const newCreator = room.users[Math.floor(Math.random() * room.users.length)];
              room.users = room.users.map((u) =>
                u.socketId === newCreator.socketId ? { ...u, isCreator: true } : { ...u, isCreator: false },
              );
              io.to(roomCode).emit('update-users', room.users);
            }

            if (room.users.length === 0) {
              delete rooms[roomCode];
            }
          }
        }
      });
    });
  }
};

export default initializeWebSocket;

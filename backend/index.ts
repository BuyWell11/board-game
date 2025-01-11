import express from 'express';
import http from 'http';
import socketIo from 'socket.io';
import cors from 'cors';

const app = express();
const server = http.createServer(app);
const io = new socketIo.Server(server, {
  path: '/socket.io',
  cors: {
    origin: '*', // или адрес вашего фронтенда
    methods: ['GET', 'POST'],
  },
});

app.use(cors());

// Функция для генерации случайного 4-значного кода комнаты
function generateRoomCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Структура данных комнаты
interface User {
  name: string;
  socketId: string;
  isCreator: boolean;
}

interface Room {
  code: string;
  users: User[];
  turn: number;
  isGameStarted: boolean;
}

let rooms: Room[] = [];

// Обработчик подключения сокетов
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Обработчик создания комнаты
  socket.on('create-room', (userName: string, callback) => {
    // Проверка, что пользователь не в другой комнате
    const existingRoom = rooms.find((room) =>
      room.users.some((user) => user.socketId === socket.id)
    );
    if (existingRoom) {
      return callback({ error: 'You are already in another room' });
    }

    // Генерация уникального кода для комнаты
    let roomCode = generateRoomCode();
    let roomExists = rooms.some((room) => room.code === roomCode);
    while (roomExists) {
      roomCode = generateRoomCode();
      roomExists = rooms.some((room) => room.code === roomCode);
    }

    // Создание новой комнаты
    const newRoom: Room = {
      code: roomCode,
      users: [{ name: userName, socketId: socket.id, isCreator: true }],
      isGameStarted: false,
      turn: 0
    };
    rooms.push(newRoom);

    // Присоединение пользователя к комнате
    socket.join(roomCode);

    // Отправка данных обратно клиенту
    callback({
      code: newRoom.code,
      users: newRoom.users,
    });
  });

  // Обработчик подключения по коду комнаты
  socket.on('join-room', (roomCode: string, userName: string, callback) => {
    // Проверка, что пользователь не в другой комнате
    const existingRoom = rooms.find((room) =>
      room.users.some((user) => user.socketId === socket.id)
    );
    if (existingRoom) {
      return callback({ error: 'You are already in another room' });
    }

    // Находим комнату по коду
    const room = rooms.find((r) => r.code === roomCode);
    if (!room) {
      return callback({ error: 'Room not found' });
    }

    if(room.isGameStarted){
      return callback({ error: 'Game already started' });
    }

    // Добавляем пользователя в комнату
    room.users.push({ name: userName, socketId: socket.id, isCreator: false });
    socket.join(roomCode);
    io.to(room.code).emit('room-updated', { ...room });

    // Отправка данных о комнате обратно клиенту
    callback({
      code: room.code,
      users: room.users,
    });
  });

  // Обработчик запроса на получение информации о текущей комнате
  socket.on('get-room', (callback) => {
    const userRoom = rooms.find((room) =>
      room.users.some((user) => user.socketId === socket.id)
    );
    if (userRoom) {
      callback({
        code: userRoom.code,
        users: userRoom.users,
      });
    } else {
      callback({ error: 'You are not in any room' });
    }
  });

  // Обновление списка пользователей
  socket.on('update-user-list', (roomCode: string, updatedUsers: User[], callback) => {
    // Ищем комнату по коду
    const room = rooms.find((room) => room.code === roomCode);
    if (!room) {
      return callback({ error: 'Room not found' });
    }

    // Проверяем, что пользователь находится в комнате
    const userInRoom = room.users.some((user) => user.socketId === socket.id);
    if (!userInRoom) {
      return callback({ error: 'You are not in this room' });
    }

    // Обновляем список пользователей
    room.users = updatedUsers;

    // Рассылаем обновленные данные всем в комнате
    io.to(roomCode).emit('room-updated', { ...room });

  });

  socket.on('start-game', (roomCode: string, callback) => {
    // Ищем комнату по коду
    const room = rooms.find((room) => room.code === roomCode);
    if (!room) {
      return callback({ error: 'Room not found' });
    }

    room.isGameStarted = true;

    // Рассылаем обновленные данные всем в комнате
    io.to(roomCode).emit('room-updated', { ...room });

  });

  socket.on('next-turn', (roomCode: string, callback) => {
    // Ищем комнату по коду
    const room = rooms.find((room) => room.code === roomCode);
    if (!room) {
      return callback({ error: 'Room not found' });
    }

    if(room.turn + 1 === room.users.length){
      room.turn = 0
    } else {
      room.turn++
    }

    // Рассылаем обновленные данные всем в комнате
    io.to(roomCode).emit('room-updated', { ...room });

  });

  socket.on('get-user-from-room', (callback) => {
    const userRoom = rooms.find((room) =>
      room.users.some((user) => user.socketId === socket.id)
    );
    if (!userRoom) {
      return callback({ error: 'You are not in any room' });
    }
    const userInRoom = userRoom.users.find((user) => user.socketId === socket.id);
    if (!userInRoom) {
      return callback({ error: 'You are not in this room' });
    }
    return callback(userInRoom)
  })

  socket.on('disconnect', () => {
    let roomToDelete: Room | null = null;
  
    // Проходим по комнатам
    rooms = rooms.reduce((acc: Room[], room: Room) => {
      // Удаляем пользователя из комнаты
      room.users = room.users.filter((user) => user.socketId !== socket.id);
  
      // Если комната пустая, помечаем её на удаление
      if (room.users.length === 0) {
        roomToDelete = room;
        return acc; // Не добавляем пустую комнату в новый массив
      }
  
      // Если создатель вышел, передаем флаг isCreator случайному участнику
      if (room.users.every((user) => !user.isCreator)) {
        const randomUser = room.users[Math.floor(Math.random() * room.users.length)];
        randomUser.isCreator = true;
      }
  
      // Уведомляем остальных пользователей об обновлении комнаты
      io.to(room.code).emit('room-updated', room);
  
      acc.push(room);
      return acc;
    }, []);
  
    // Если комната была помечена на удаление, удаляем её
    if (roomToDelete) {
      rooms = rooms.filter((room) => room !== roomToDelete);
    }
  
    console.log(`User disconnected: ${socket.id}`);
    console.log(`Rooms: `, rooms);
  });
});

// Запуск сервера
server.listen(4000, () => {
  console.log('Server is running on http://localhost:4000');
});

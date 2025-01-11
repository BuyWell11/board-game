'use client';
import { useSocket } from '@/context/SocketContext';
import { Room, User } from '@/typing/model';
import { useEffect, useState } from 'react';
import { Box, Button, Text } from '@chakra-ui/react';
import '../../styles/page/room-page.scss';
import '../../styles/page/page.scss';
import PlayerCard from '@/components/ui/PlayerCard';
import PlayerCardControlled from '@/components/ui/PlayerCardControlled';

const RoomPage = () => {
  const { socket } = useSocket();
  const [room, setRoom] = useState<Room | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (!socket) {
      return;
    }
    socket.emit('get-room', (data: Room) => {
      setRoom(data); // Обновление состояния с данными комнаты
    });
    socket.emit('get-user-from-room', (data: User) => {
      setUser(data);
    });
    socket.on('room-updated', (updatedRoom: Room) => {
      setRoom({ ...updatedRoom });
    });
    return () => {
      socket.off('room-updated');
    };
  }, [socket]);

  if (!room) {
    return null;
  }

  const handleMoveLeft = (index: number) => {
    if (index > 0 && index < room.users.length) {
      const newUsers = [...room.users];
      [newUsers[index], newUsers[index - 1]] = [newUsers[index - 1], newUsers[index]];
      setRoom({ ...room, users: newUsers });
      if (!socket) {
        return;
      }
      socket.emit('update-user-list', room.code, newUsers);
    }
  };

  const handleMoveRight = (index: number) => {
    if (index >= 0 && index < room.users.length - 1) {
      const newUsers = [...room.users];
      [newUsers[index], newUsers[index + 1]] = [newUsers[index + 1], newUsers[index]];
      setRoom({ ...room, users: newUsers });
      if (!socket) {
        return;
      }
      socket.emit('update-user-list', room.code, newUsers);
    }
  };

  return (
    <Box className={'page'}>
      {!room.isGameStarted ? (
        <Text textStyle="xl" fontWeight="bold">
          Room code: {room.code}
        </Text>
      ) : (
        <Text textStyle="xl" fontWeight="bold">
          {room.users[room.turn].name}&#39;s turn
        </Text>
      )}
      <Box className="container">
        {user?.isCreator && !room.isGameStarted
          ? room.users.map((user, index) => (
              <PlayerCardControlled
                key={user.socketId}
                user={user}
                isFirst={index === 0}
                isLast={index === room.users.length - 1}
                index={index}
                handleLeftClick={handleMoveLeft}
                handleRightClick={handleMoveRight}
              />
            ))
          : room.users.map((user, index) => (
              <PlayerCard gameStarted={room.isGameStarted} turn={room.turn} index={index} key={user.socketId} user={user} />
            ))}
      </Box>
      {user?.isCreator && !room.isGameStarted && (
        <Button
          size="xl"
          variant="outline"
          onClick={() => {
            if (!socket) {
              return;
            }
            socket.emit('start-game', room?.code);
          }}
        >
          <Text textStyle="xl" fontWeight="bold">
            Start Game
          </Text>
        </Button>
      )}
      {room.isGameStarted && user?.socketId === room.users[room.turn].socketId && (
        <Button
          size="xl"
          variant="outline"
          onClick={() => {
            if (!socket) {
              return;
            }
            socket.emit('next-turn', room?.code);
          }}
        >
          <Text textStyle="xl" fontWeight="bold">
            End Turn
          </Text>
        </Button>
      )}
    </Box>
  );
};

export default RoomPage;

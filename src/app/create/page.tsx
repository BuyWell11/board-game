'use client';

import { Box, Button, Input } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { Field } from '@/components/ui/field';
import { useSocket } from '@/context/SocketContext';
import { Room } from '@/typing/model';
import { useRouter } from 'next/navigation';
import '../../styles/page/page.scss';
import '../../styles/page/create-join-room-page.scss';

interface FormValues {
  nickname: string;
}

const CreateRoom = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>();
  const router = useRouter();
  const { socket } = useSocket();
  if (!socket) {
    return;
  }

  const onSubmit = handleSubmit((formData) => {
    if (formData.nickname.trim() === '') {
      return;
    }

    // Отправка запроса на создание комнаты
    socket.emit('create-room', formData.nickname, (response: Room) => {
      if (response.error) {
        alert(response.error);
        return;
      }
      router.push(`/${response.code}`);
    });
  });

  return (
    <Box className={'page'}>
      <form onSubmit={onSubmit} className={'create-join-form'}>
        <Field label="Nickname" invalid={!!errors.nickname} errorText={errors.nickname?.message}>
          <Input {...register('nickname', { required: 'Nickname is required' })} />
        </Field>
        <Button type="submit">Submit</Button>
      </form>
    </Box>
  );
};

export default CreateRoom;

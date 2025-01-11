import { Box, Text } from '@chakra-ui/react';
import { User } from '@/typing/model';
import '../../styles/shared/player-card.scss';

interface Props {
  turn: number;
  index: number;
  gameStarted: boolean;
  user: User;
}

const PlayerCard = ({ user, turn, index, gameStarted }: Props) => {
  return (
    <Box className={`player-card ${gameStarted && turn === index ? 'player-card-turn' : null}`}>
      <Text textStyle="xl" fontWeight="bold">
        {user.name}
      </Text>
    </Box>
  );
};

export default PlayerCard;

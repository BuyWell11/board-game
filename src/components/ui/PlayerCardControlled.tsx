import { Box, IconButton, Text } from '@chakra-ui/react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { User } from '@/typing/model';
import '../../styles/shared/player-card.scss';

interface Props {
  user: User;
  isFirst: boolean;
  isLast: boolean;
  index: number;
  handleLeftClick: (index: number) => void;
  handleRightClick: (index: number) => void;
}

const PlayerCardControlled = ({ user, isFirst, isLast, index, handleLeftClick, handleRightClick }: Props) => {
  return (
    <Box className={'player-card'}>
      <Text textStyle="xl" fontWeight="bold">
        {user.name}
      </Text>
      <Box>
        <IconButton onClick={() => handleLeftClick(index)}>
          <ArrowBackIcon sx={isFirst ? { color: '#5b5959' } : null} />
        </IconButton>
        <IconButton onClick={() => handleRightClick(index)}>
          <ArrowForwardIcon sx={isLast ? { color: '#5b5959' } : null} />
        </IconButton>
      </Box>
    </Box>
  );
};

export default PlayerCardControlled;

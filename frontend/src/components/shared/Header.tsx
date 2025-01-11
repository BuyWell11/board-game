import { Box, Heading, Text } from '@chakra-ui/react';
import SwitchWithLabel from '@/components/shared/SwitchWithLabel';
import '../../styles/layout.scss';
import Link from 'next/link';

const Header = () => {
  return (
    <Heading>
      <Box className={'header'}>
        <Link href={'/'}>
          <Text textStyle="xl" fontWeight="bold">
            Board Game
          </Text>
        </Link>
        <SwitchWithLabel label={'Light mode'} />
      </Box>
    </Heading>
  );
};

export default Header;

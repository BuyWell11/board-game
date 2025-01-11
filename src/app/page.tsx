'use client';
import '../styles/page/main-page.scss';
import '../styles/page/page.scss';
import { Box, Button, Text } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  return (
    <div className={'page'}>
      <main className={'main'}>
        <Box className={'main-button-container'}>
          <Button size="xl" variant="outline" onClick={() => router.push('/create')}>
            <Text textStyle="xl" fontWeight="bold">
              Create room
            </Text>
          </Button>
          <Button size="xl" variant="outline" onClick={() => router.push('/join')}>
            <Text textStyle="xl" fontWeight="bold">
              Join room
            </Text>
          </Button>
        </Box>
      </main>
    </div>
  );
}

import { Hono } from 'hono';
import { context, redis, reddit } from '@devvit/web/server';
import type {
  DecrementResponse,
  IncrementResponse,
  InitResponse,
  LeaderboardEntry,
  LeaderboardGetResponse,
  LeaderboardPostResponse,
} from '../../shared/api';

type ErrorResponse = {
  status: 'error';
  message: string;
};

export const api = new Hono();

api.get('/init', async (c) => {
  const { postId } = context;

  if (!postId) {
    console.error('API Init Error: postId not found in devvit context');
    return c.json<ErrorResponse>(
      {
        status: 'error',
        message: 'postId is required but missing from context',
      },
      400
    );
  }

  try {
    const [count, username] = await Promise.all([
      redis.get('count'),
      reddit.getCurrentUsername(),
    ]);

    return c.json<InitResponse>({
      type: 'init',
      postId: postId,
      count: count ? parseInt(count) : 0,
      username: username ?? 'anonymous',
    });
  } catch (error) {
    console.error(`API Init Error for post ${postId}:`, error);
    let errorMessage = 'Unknown error during initialization';
    if (error instanceof Error) {
      errorMessage = `Initialization failed: ${error.message}`;
    }
    return c.json<ErrorResponse>(
      { status: 'error', message: errorMessage },
      400
    );
  }
});

api.post('/increment', async (c) => {
  const { postId } = context;
  if (!postId) {
    return c.json<ErrorResponse>(
      {
        status: 'error',
        message: 'postId is required',
      },
      400
    );
  }

  const count = await redis.incrBy('count', 1);
  return c.json<IncrementResponse>({
    count,
    postId,
    type: 'increment',
  });
});

api.post('/decrement', async (c) => {
  const { postId } = context;
  if (!postId) {
    return c.json<ErrorResponse>(
      {
        status: 'error',
        message: 'postId is required',
      },
      400
    );
  }

  const count = await redis.incrBy('count', -1);
  return c.json<DecrementResponse>({
    count,
    postId,
    type: 'decrement',
  });
});

api.get('/highscore', async (c) => {
  try {
    const username = (await reddit.getCurrentUsername()) ?? 'anonymous';
    const scoreStr = await redis.get(`highscore:${username}`);
    const highscore = scoreStr ? parseInt(scoreStr) : 0;
    return c.json({
      type: 'highscore',
      username,
      highscore,
    });
  } catch (error) {
    console.error('API get highscore error:', error);
    return c.json<ErrorResponse>({ status: 'error', message: 'Failed to retrieve high score' }, 500);
  }
});

api.post('/highscore', async (c) => {
  try {
    const { score } = await c.req.json<{ score: number }>();
    const username = (await reddit.getCurrentUsername()) ?? 'anonymous';
    const currentScoreStr = await redis.get(`highscore:${username}`);
    const currentHigh = currentScoreStr ? parseInt(currentScoreStr) : 0;

    let finalHigh = currentHigh;
    if (score > currentHigh) {
      await redis.set(`highscore:${username}`, score.toString());
      finalHigh = score;
    }

    return c.json({
      type: 'highscore',
      username,
      highscore: finalHigh,
    });
  } catch (error) {
    console.error('API post highscore error:', error);
    return c.json<ErrorResponse>({ status: 'error', message: 'Failed to save score' }, 500);
  }
});

api.get('/leaderboard', async (c) => {
  try {
    const fetchCategory = async (key: string): Promise<LeaderboardEntry[]> => {
      const dataStr = await redis.get(key);
      if (dataStr) {
        try {
          return JSON.parse(dataStr) as LeaderboardEntry[];
        } catch (e) {
          return [];
        }
      }
      return [];
    };

    const [scoreList, lightningList, novaList] = await Promise.all([
      fetchCategory('leaderboard_score'),
      fetchCategory('leaderboard_lightning'),
      fetchCategory('leaderboard_nova'),
    ]);

    return c.json<LeaderboardGetResponse>({
      status: 'success',
      leaderboards: {
        score: scoreList,
        lightning: lightningList,
        nova: novaList,
      },
    });
  } catch (error) {
    console.error('API get leaderboard error:', error);
    return c.json<ErrorResponse>({ status: 'error', message: 'Failed to retrieve leaderboards' }, 500);
  }
});

api.post('/leaderboard', async (c) => {
  try {
    const { score, lightningChain, novaChain } = await c.req.json<{
      score: number;
      lightningChain: number;
      novaChain: number;
    }>();

    const username = (await reddit.getCurrentUsername()) ?? 'anonymous';
    const timestamp = new Date().toISOString();

    const updateCategory = async (key: string, value: number): Promise<LeaderboardEntry[]> => {
      const dataStr = await redis.get(key);
      let list: LeaderboardEntry[] = [];
      if (dataStr) {
        try {
          list = JSON.parse(dataStr) as LeaderboardEntry[];
        } catch (e) {
          list = [];
        }
      }

      // Check if qualifies
      const lowestScore = list.length >= 10 ? list[list.length - 1]!.score : -1;
      if (value > lowestScore || list.length < 10) {
        // If username already has an entry, should we update or allow multiple entries?
        // "Update top 10 entries stored as JSON array... if the current score beats the lowest in the top 10 or if fewer than 10 entries exist."
        // We just add a new entry, sort, and slice to keep top 10.
        list.push({ username, score: value, timestamp });
        // Sort descending
        list.sort((a, b) => b.score - a.score);
        // Limit to top 10
        list = list.slice(0, 10);
        await redis.set(key, JSON.stringify(list));
      }
      return list;
    };

    const [updatedScore, updatedLightning, updatedNova] = await Promise.all([
      updateCategory('leaderboard_score', score),
      updateCategory('leaderboard_lightning', lightningChain),
      updateCategory('leaderboard_nova', novaChain),
    ]);

    return c.json<LeaderboardPostResponse>({
      status: 'success',
      username,
      leaderboards: {
        score: updatedScore,
        lightning: updatedLightning,
        nova: updatedNova,
      },
    });
  } catch (error) {
    console.error('API post leaderboard error:', error);
    return c.json<ErrorResponse>({ status: 'error', message: 'Failed to update leaderboards' }, 500);
  }
});



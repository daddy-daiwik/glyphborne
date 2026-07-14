import { Hono } from 'hono';
import { context, redis, reddit } from '@devvit/web/server';
import type {
  DecrementResponse,
  IncrementResponse,
  InitResponse,
  LeaderboardEntry,
  LeaderboardGetResponse,
  LeaderboardPostResponse,
  UpgradesData,
  WelcomeBonusData,
  PlayerProgressResponse,
  StreakResponse,
  XpResponse,
  UpgradeResponse,
  WelcomeResponse,
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

    const [scoreList, tridentList, lightningList, novaList, poisonList] = await Promise.all([
      fetchCategory('leaderboard_score'),
      fetchCategory('leaderboard_trident'),
      fetchCategory('leaderboard_lightning'),
      fetchCategory('leaderboard_nova'),
      fetchCategory('leaderboard_poison'),
    ]);

    return c.json<LeaderboardGetResponse>({
      status: 'success',
      leaderboards: {
        score: scoreList,
        trident: tridentList,
        lightning: lightningList,
        nova: novaList,
        poison: poisonList,
      },
    });
  } catch (error) {
    console.error('API get leaderboard error:', error);
    return c.json<ErrorResponse>({ status: 'error', message: 'Failed to retrieve leaderboards' }, 500);
  }
});

api.post('/leaderboard', async (c) => {
  try {
    const { score, tridentChain, lightningChain, novaChain, poisonChain } = await c.req.json<{
      score: number;
      tridentChain: number;
      lightningChain: number;
      novaChain: number;
      poisonChain: number;
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
      const lowestScore = list.length >= 100 ? list[list.length - 1]!.score : -1;
      if (value > lowestScore || list.length < 100) {
        list.push({ username, score: value, timestamp });
        list.sort((a, b) => b.score - a.score);
        list = list.slice(0, 100);
        await redis.set(key, JSON.stringify(list));
      }
      return list;
    };

    const [updatedScore, updatedTrident, updatedLightning, updatedNova, updatedPoison] = await Promise.all([
      updateCategory('leaderboard_score', score),
      updateCategory('leaderboard_trident', tridentChain ?? 0),
      updateCategory('leaderboard_lightning', lightningChain),
      updateCategory('leaderboard_nova', novaChain),
      updateCategory('leaderboard_poison', poisonChain ?? 0),
      redis.set(`player:${username}:lastScore`, score.toString()),
    ]);

    return c.json<LeaderboardPostResponse>({
      status: 'success',
      username,
      leaderboards: {
        score: updatedScore,
        trident: updatedTrident,
        lightning: updatedLightning,
        nova: updatedNova,
        poison: updatedPoison,
      },
    });
  } catch (error) {
    console.error('API post leaderboard error:', error);
    return c.json<ErrorResponse>({ status: 'error', message: 'Failed to update leaderboards' }, 500);
  }
});

// Helper to get player progress from Redis
async function getPlayerProgress(username: string): Promise<PlayerProgressResponse> {
  const [streakStr, lastPlayed, xpStr, levelStr, upgradesStr, welcomeBonusStr, lastScoreStr] = await Promise.all([
    redis.get(`player:${username}:streak`),
    redis.get(`player:${username}:lastPlayed`),
    redis.get(`player:${username}:xp`),
    redis.get(`player:${username}:level`),
    redis.get(`player:${username}:upgrades`),
    redis.get(`player:${username}:welcomeBonus`),
    redis.get(`player:${username}:lastScore`),
  ]);

  const streak = streakStr ? parseInt(streakStr, 10) : 0;
  const xp = xpStr ? parseInt(xpStr, 10) : 0;
  const level = levelStr ? parseInt(levelStr, 10) : 1;
  const lastScore = lastScoreStr ? parseInt(lastScoreStr, 10) : 0;

  let upgrades: UpgradesData = { speed: 0, damage: 0, hp: 0, pickup: 0 };
  if (upgradesStr) {
    try {
      upgrades = JSON.parse(upgradesStr) as UpgradesData;
    } catch (e) {
      // ignore
    }
  }

  let welcomeBonus: WelcomeBonusData = { type: 'score', value: 0, claimed: true };
  if (welcomeBonusStr) {
    try {
      welcomeBonus = JSON.parse(welcomeBonusStr) as WelcomeBonusData;
    } catch (e) {
      // ignore
    }
  }

  // Check if player has welcome back bonus available (not played for 24 hours)
  if (lastPlayed) {
    const timeDiff = Date.now() - new Date(lastPlayed).getTime();
    if (timeDiff >= 24 * 60 * 60 * 1000) {
      // If the current welcome bonus is already claimed (i.e. not active/unclaimed), generate a new one
      if (welcomeBonus.claimed) {
        const bonuses: WelcomeBonusData[] = [
          { type: 'score', value: 50, claimed: false },
          { type: 'orbs', value: 1, claimed: false },
          { type: 'hp', value: 20, claimed: false },
          { type: 'doubleKills', value: 10, claimed: false },
        ];
        const newBonus = bonuses[Math.floor(Math.random() * bonuses.length)]!;
        await redis.set(`player:${username}:welcomeBonus`, JSON.stringify(newBonus));
        welcomeBonus = newBonus;
      }
    }
  }

  return {
    username,
    streak,
    lastPlayed: lastPlayed || '',
    xp,
    level,
    upgrades,
    welcomeBonus,
    lastScore,
  };
}

function getStreakMultiplier(streak: number): number {
  if (streak <= 1) return 1.0;
  if (streak === 2) return 1.1;
  if (streak === 3) return 1.2;
  if (streak === 4) return 1.4;
  if (streak === 5) return 1.6;
  if (streak === 6) return 1.8;
  return 2.0; // 7+
}

// GET /api/player/progress — return all player progress data
api.get('/player/progress', async (c) => {
  try {
    const username = (await reddit.getCurrentUsername()) ?? 'anonymous';
    const progress = await getPlayerProgress(username);
    return c.json<PlayerProgressResponse>(progress);
  } catch (error) {
    console.error('API get player progress error:', error);
    return c.json<ErrorResponse>({ status: 'error', message: 'Failed to retrieve player progress' }, 500);
  }
});

// POST /api/player/streak — update streak and return current streak + bonus
api.post('/player/streak', async (c) => {
  try {
    const username = (await reddit.getCurrentUsername()) ?? 'anonymous';
    const streakStr = await redis.get(`player:${username}:streak`);
    const lastPlayed = await redis.get(`player:${username}:lastPlayed`);

    let streak = streakStr ? parseInt(streakStr, 10) : 0;

    const today = new Date().toISOString().split('T')[0]!;
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - 1);
    const yesterday = d.toISOString().split('T')[0]!;

    if (!lastPlayed) {
      streak = 1;
    } else {
      const lastPlayedDate = lastPlayed.split('T')[0]!;
      if (lastPlayedDate === today) {
        // already played today, streak remains same
      } else if (lastPlayedDate === yesterday) {
        streak += 1;
      } else {
        streak = 1;
      }
    }

    const currentISO = new Date().toISOString();
    await Promise.all([
      redis.set(`player:${username}:streak`, streak.toString()),
      redis.set(`player:${username}:lastPlayed`, currentISO),
    ]);

    return c.json<StreakResponse>({
      streak,
      bonusMultiplier: getStreakMultiplier(streak),
      lastPlayed: currentISO,
    });
  } catch (error) {
    console.error('API post player streak error:', error);
    return c.json<ErrorResponse>({ status: 'error', message: 'Failed to update player streak' }, 500);
  }
});

// POST /api/player/xp — add XP, check for level up, return new level and available upgrades
api.post('/player/xp', async (c) => {
  try {
    const username = (await reddit.getCurrentUsername()) ?? 'anonymous';
    const { xpToAdd } = await c.req.json<{ xpToAdd: number }>();

    const xpStr = await redis.get(`player:${username}:xp`);
    const oldXp = xpStr ? parseInt(xpStr, 10) : 0;
    const newXp = oldXp + xpToAdd;
    await redis.set(`player:${username}:xp`, newXp.toString());

    const oldLevel = Math.floor(oldXp / 50) + 1;
    const newLevel = Math.floor(newXp / 50) + 1;
    const leveledUp = newLevel > oldLevel;

    await redis.set(`player:${username}:level`, newLevel.toString());

    const upgradesStr = await redis.get(`player:${username}:upgrades`);
    let upgrades: UpgradesData = { speed: 0, damage: 0, hp: 0, pickup: 0 };
    if (upgradesStr) {
      try {
        upgrades = JSON.parse(upgradesStr) as UpgradesData;
      } catch (e) {
        // Ignore JSON parse error
      }
    }

    const availableUpgrades: string[] = [];
    if (upgrades.speed < 3) availableUpgrades.push('speed');
    if (upgrades.damage < 3) availableUpgrades.push('damage');
    if (upgrades.hp < 3) availableUpgrades.push('hp');
    if (upgrades.pickup < 3) availableUpgrades.push('pickup');

    return c.json<XpResponse>({
      xp: newXp,
      level: newLevel,
      leveledUp,
      availableUpgrades,
    });
  } catch (error) {
    console.error('API post player xp error:', error);
    return c.json<ErrorResponse>({ status: 'error', message: 'Failed to update player XP' }, 500);
  }
});

// POST /api/player/upgrade — apply an upgrade choice
api.post('/player/upgrade', async (c) => {
  try {
    const username = (await reddit.getCurrentUsername()) ?? 'anonymous';
    const { upgradeType } = await c.req.json<{ upgradeType: 'speed' | 'damage' | 'hp' | 'pickup' }>();

    const upgradesStr = await redis.get(`player:${username}:upgrades`);
    let upgrades: UpgradesData = { speed: 0, damage: 0, hp: 0, pickup: 0 };
    if (upgradesStr) {
      try {
        upgrades = JSON.parse(upgradesStr) as UpgradesData;
      } catch (e) {
        // Ignore JSON parse error
      }
    }

    if (upgradeType in upgrades) {
      if (upgrades[upgradeType] < 3) {
        upgrades[upgradeType]++;
        await redis.set(`player:${username}:upgrades`, JSON.stringify(upgrades));
      }
    }

    return c.json<UpgradeResponse>({
      status: 'success',
      upgrades,
    });
  } catch (error) {
    console.error('API post player upgrade error:', error);
    return c.json<ErrorResponse>({ status: 'error', message: 'Failed to apply upgrade' }, 500);
  }
});

// POST /api/player/welcome — claim welcome bonus (or consume it)
api.post('/player/welcome', async (c) => {
  try {
    const username = (await reddit.getCurrentUsername()) ?? 'anonymous';
    const { action } = await c.req.json<{ action?: 'claim' | 'consume' }>();

    const welcomeBonusStr = await redis.get(`player:${username}:welcomeBonus`);
    let welcomeBonus: WelcomeBonusData = { type: 'score', value: 0, claimed: true };
    if (welcomeBonusStr) {
      try {
        welcomeBonus = JSON.parse(welcomeBonusStr) as WelcomeBonusData;
      } catch (e) {
        // Ignore JSON parse error
      }
    }

    if (action === 'consume') {
      // mark as completely consumed / empty
      welcomeBonus = { type: 'score', value: 0, claimed: true };
      await redis.set(`player:${username}:welcomeBonus`, JSON.stringify(welcomeBonus));
    } else {
      // default: claim
      welcomeBonus.claimed = true;
      await redis.set(`player:${username}:welcomeBonus`, JSON.stringify(welcomeBonus));
    }

    return c.json<WelcomeResponse>({
      status: 'success',
      welcomeBonus,
    });
  } catch (error) {
    console.error('API post player welcome error:', error);
    return c.json<ErrorResponse>({ status: 'error', message: 'Failed to handle welcome bonus' }, 500);
  }
});




import { Hono } from 'hono';
import type { OnAppInstallRequest, TriggerResponse } from '@devvit/web/shared';
import { context, realtime, redis } from '@devvit/web/server';
import { createPost } from '../core/post';

export const triggers = new Hono();

triggers.post('/on-app-install', async (c) => {
  try {
    const post = await createPost();
    const input = await c.req.json<OnAppInstallRequest>();

    return c.json<TriggerResponse>(
      {
        status: 'success',
        message: `Post created in subreddit ${context.subredditName} with id ${post.id} (trigger: ${input.type})`,
      },
      200
    );
  } catch (error) {
    console.error(`Error creating post: ${error}`);
    return c.json<TriggerResponse>(
      {
        status: 'error',
        message: 'Failed to create post',
      },
      400
    );
  }
});

triggers.post('/on-comment-submit', async (c) => {
  try {
    const event = await c.req.json<any>();
    
    // Safety check to ensure we have a comment body and a post ID
    if (!event?.comment?.body || !event?.post?.id) {
      return c.json({ status: 'ignored' }, 200);
    }
    
    const text = event.comment.body.toLowerCase();
    
    // Check if the comment contains our specific drop commands
    let dropType = '';
    let targetPlayer = '';
    
    if (text.includes('!dropmana')) dropType = 'mana';
    if (text.includes('!healplayer')) dropType = 'heal';
    
    if (dropType) {
      const targetMatch = text.match(/(?:@|u\/)([a-zA-Z0-9_-]+)/);
      if (targetMatch) {
        targetPlayer = targetMatch[1];
      }
      
      let count = 1;
      const countMatch = text.match(/\b(\d+)\b/);
      if (countMatch) {
        count = parseInt(countMatch[1], 10);
        if (count > 30) count = 30; // Cap at 30 to prevent performance issues
      }

      const author = event.author?.name || 'A_viewer';

      // Rate limit: one drop per author per 10 seconds
      const rateLimitKey = `comment_drop_rl:${author}`;
      const alreadySent = await redis.get(rateLimitKey);
      if (alreadySent) {
        return c.json<TriggerResponse>({ status: 'success', message: 'Rate limited' }, 200);
      }
      await redis.set(rateLimitKey, '1', { expiration: new Date(Date.now() + 10_000) });

      // Broadcast the event to all active game clients watching this post
      await realtime.send(event.post.id, {
        type: 'comment_drop',
        dropType: dropType,
        author: author,
        targetPlayer: targetPlayer,
        count: count
      });
    }
    
    return c.json<TriggerResponse>({ status: 'success', message: 'Comment processed' }, 200);
  } catch (error) {
    console.error(`Error in on-comment-submit: ${error}`);
    return c.json<TriggerResponse>({ status: 'error', message: 'Failed to process comment' }, 400);
  }
});

import { processAIData } from '../services/ai.service';

export interface AIMatchingJobData {
  itemId: string;
  type: 'lost' | 'found';
}

/**
 * Worker handler to process background AI matching jobs.
 */
export const handleAIMatchingJob = async (job: { data: AIMatchingJobData }): Promise<void> => {
  const { itemId, type } = job.data;
  console.log(`[Background AI Worker] Processing job for ${type} item ${itemId}`);
  
  try {
    // Call processAIData with isWorkerJob = true to avoid infinite enqueue loop
    await processAIData(itemId, type, true);
    console.log(`[Background AI Worker] Completed matching job for ${type} item ${itemId}`);
  } catch (error) {
    console.error(`[Background AI Worker] Job processing failed for ${type} item ${itemId}:`, error);
    throw error;
  }
};

let aiQueue: any = null;
let aiWorker: any = null;
let isBullMQActive = false;

/**
 * Initializes BullMQ queue and worker if Redis configuration is available.
 * Gracefully falls back to synchronous processing otherwise.
 */
export const initAIWorker = async (): Promise<void> => {
  const redisHost = process.env.REDIS_HOST;
  const redisUrl = process.env.REDIS_URL;

  if (!redisHost && !redisUrl) {
    console.log('[Background AI Worker] Redis connection parameters not found in environment. Fallback: Direct Asynchronous execution.');
    return;
  }

  try {
    // Dynamic import to prevent app crash if bullmq dependency is not installed
    // @ts-ignore
    const { Queue, Worker } = await import('bullmq');

    const connectionOpt: any = redisUrl ? {
      url: redisUrl
    } : {
      host: redisHost || '127.0.0.1',
      port: Number(process.env.REDIS_PORT) || 6379,
      password: process.env.REDIS_PASSWORD || undefined
    };

    aiQueue = new Queue('ai-matching', { connection: connectionOpt });
    console.log('[Background AI Worker] BullMQ Queue initialized successfully.');

    aiWorker = new Worker('ai-matching', async (job: any) => {
      await handleAIMatchingJob(job);
    }, { connection: connectionOpt });

    aiWorker.on('completed', (job: any) => {
      console.log(`[Background AI Worker] Job ${job.id} completed successfully.`);
    });

    aiWorker.on('failed', (job: any, err: Error) => {
      console.error(`[Background AI Worker] Job ${job?.id} failed:`, err);
    });

    isBullMQActive = true;
    console.log('[Background AI Worker] BullMQ Worker listener started.');
  } catch (error) {
    console.warn('[Background AI Worker] BullMQ module not installed or Redis connection failed. Using Direct fallback.', error);
  }
};

/**
 * Checks if the BullMQ/Redis worker system is active.
 */
export const isQueueActive = (): boolean => {
  return isBullMQActive && aiQueue !== null;
};

/**
 * Dispatches an AI matching job. Enqueues in Redis if active, otherwise falls back to direct async execution.
 */
export const dispatchAIMatchingJob = async (itemId: string, type: 'lost' | 'found'): Promise<void> => {
  if (isQueueActive()) {
    try {
      await aiQueue.add('ai-match', { itemId, type }, {
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 }
      });
      console.log(`[Background AI Worker] Enqueued AI match job in BullMQ for ${type} item ${itemId}`);
      return;
    } catch (err) {
      console.error('[Background AI Worker] Failed to add job to queue. Falling back to direct execution.', err);
    }
  }

  // Fallback: execute processAIData directly and asynchronously in background
  console.log(`[Background AI Worker] Direct async processing fallback for ${type} item ${itemId}`);
  processAIData(itemId, type, true).catch(console.error);
};

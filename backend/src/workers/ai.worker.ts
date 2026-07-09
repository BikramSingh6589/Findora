import { processAIData } from '../services/ai.service';

export interface AIMatchingJobData {
  itemId: string;
  type: 'lost' | 'found';
}

/**
 * Worker handler to process background AI matching jobs.
 * Integrates cleanly with BullMQ and Redis connection schemas.
 */
export const handleAIMatchingJob = async (job: { data: AIMatchingJobData }): Promise<void> => {
  const { itemId, type } = job.data;
  console.log(`[Background AI Worker] Processing job for ${type} item ${itemId}`);
  
  try {
    await processAIData(itemId, type);
    console.log(`[Background AI Worker] Completed matching job for ${type} item ${itemId}`);
  } catch (error) {
    console.error(`[Background AI Worker] Job processing failed for ${type} item ${itemId}:`, error);
    throw error; // Let BullMQ retry/fail the job
  }
};

// Hook worker to Queue in production (example):
// import { Worker } from 'bullmq';
// const worker = new Worker('ai-matching', async (job) => {
//   await handleAIMatchingJob(job);
// }, { connection: redisConnection });

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dispatchAIMatchingJob = exports.isQueueActive = exports.initAIWorker = exports.handleAIMatchingJob = void 0;
const ai_service_1 = require("../services/ai.service");
/**
 * Worker handler to process background AI matching jobs.
 */
const handleAIMatchingJob = async (job) => {
    const { itemId, type } = job.data;
    console.log(`[Background AI Worker] Processing job for ${type} item ${itemId}`);
    try {
        // Call processAIData with isWorkerJob = true to avoid infinite enqueue loop
        await (0, ai_service_1.processAIData)(itemId, type, true);
        console.log(`[Background AI Worker] Completed matching job for ${type} item ${itemId}`);
    }
    catch (error) {
        console.error(`[Background AI Worker] Job processing failed for ${type} item ${itemId}:`, error);
        throw error;
    }
};
exports.handleAIMatchingJob = handleAIMatchingJob;
let aiQueue = null;
let aiWorker = null;
let isBullMQActive = false;
/**
 * Initializes BullMQ queue and worker if Redis configuration is available.
 * Gracefully falls back to synchronous processing otherwise.
 */
const initAIWorker = async () => {
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
        const connectionOpt = redisUrl ? {
            url: redisUrl
        } : {
            host: redisHost || '127.0.0.1',
            port: Number(process.env.REDIS_PORT) || 6379,
            password: process.env.REDIS_PASSWORD || undefined
        };
        aiQueue = new Queue('ai-matching', { connection: connectionOpt });
        console.log('[Background AI Worker] BullMQ Queue initialized successfully.');
        aiWorker = new Worker('ai-matching', async (job) => {
            await (0, exports.handleAIMatchingJob)(job);
        }, { connection: connectionOpt });
        aiWorker.on('completed', (job) => {
            console.log(`[Background AI Worker] Job ${job.id} completed successfully.`);
        });
        aiWorker.on('failed', (job, err) => {
            console.error(`[Background AI Worker] Job ${job?.id} failed:`, err);
        });
        isBullMQActive = true;
        console.log('[Background AI Worker] BullMQ Worker listener started.');
    }
    catch (error) {
        console.warn('[Background AI Worker] BullMQ module not installed or Redis connection failed. Using Direct fallback.', error);
    }
};
exports.initAIWorker = initAIWorker;
/**
 * Checks if the BullMQ/Redis worker system is active.
 */
const isQueueActive = () => {
    return isBullMQActive && aiQueue !== null;
};
exports.isQueueActive = isQueueActive;
/**
 * Dispatches an AI matching job. Enqueues in Redis if active, otherwise falls back to direct async execution.
 */
const dispatchAIMatchingJob = async (itemId, type) => {
    if ((0, exports.isQueueActive)()) {
        try {
            await aiQueue.add('ai-match', { itemId, type }, {
                attempts: 3,
                backoff: { type: 'exponential', delay: 5000 }
            });
            console.log(`[Background AI Worker] Enqueued AI match job in BullMQ for ${type} item ${itemId}`);
            return;
        }
        catch (err) {
            console.error('[Background AI Worker] Failed to add job to queue. Falling back to direct execution.', err);
        }
    }
    // Fallback: execute processAIData directly and asynchronously in background
    console.log(`[Background AI Worker] Direct async processing fallback for ${type} item ${itemId}`);
    (0, ai_service_1.processAIData)(itemId, type, true).catch(console.error);
};
exports.dispatchAIMatchingJob = dispatchAIMatchingJob;

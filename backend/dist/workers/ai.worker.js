"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleAIMatchingJob = void 0;
const ai_service_1 = require("../services/ai.service");
/**
 * Worker handler to process background AI matching jobs.
 * Integrates cleanly with BullMQ and Redis connection schemas.
 */
const handleAIMatchingJob = async (job) => {
    const { itemId, type } = job.data;
    console.log(`[Background AI Worker] Processing job for ${type} item ${itemId}`);
    try {
        await (0, ai_service_1.processAIData)(itemId, type);
        console.log(`[Background AI Worker] Completed matching job for ${type} item ${itemId}`);
    }
    catch (error) {
        console.error(`[Background AI Worker] Job processing failed for ${type} item ${itemId}:`, error);
        throw error; // Let BullMQ retry/fail the job
    }
};
exports.handleAIMatchingJob = handleAIMatchingJob;
// Hook worker to Queue in production (example):
// import { Worker } from 'bullmq';
// const worker = new Worker('ai-matching', async (job) => {
//   await handleAIMatchingJob(job);
// }, { connection: redisConnection });

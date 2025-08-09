import cron from 'node-cron';
import { proximityTracker } from './tracker.js';
function startCronJobs() {
    cron.schedule('0 0 * * *', () => {
        console.log('Running task every 24 hours');
        // your task here
    });
}



startCronJobs();

proximityTracker.start();
console.log('Cron jobs started');
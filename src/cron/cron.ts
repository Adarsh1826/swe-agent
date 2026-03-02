import nodeCron from "node-cron";
import processQueue from "../queue/queue.js";
let isRunning = false;

nodeCron.schedule("*/10 * * * * *",async()=>{
    if(isRunning) return

    isRunning=true;
    try {
        console.log("cron started"); 
        await processQueue()
    } finally {
        isRunning=false;
    }

})
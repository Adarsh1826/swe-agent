import { Webhooks } from "@octokit/webhooks";
const webhooksecret=process.env.WEBHOOK_SECRET!
if(!webhooksecret){
    throw new Error("Webhook credentials is missing")
}
export const webhook = new Webhooks({
    secret:webhooksecret
})


// webhook handler for issue creation
webhook.on('issues.opened',async({payload})=>{
    console.log(payload.issue.title);
    
})


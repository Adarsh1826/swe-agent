import { Webhooks } from "@octokit/webhooks";
import { CustomError } from "../utils/constructor/error";

import 'dotenv/config';


if(!process.env.WEBHOOK_SECRET){
    throw new CustomError({message:"Webhook secret is missing",statusCode:500})
}


export const webhook = new Webhooks({secret:process.env.WEBHOOK_SECRET})

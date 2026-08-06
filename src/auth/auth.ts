import { App } from "@octokit/app";

const appId = process.env.APP_ID!
const privateKey = process.env.PRIVATE_KEY?.replace(/\\n/g, "\n");

if(!appId || !privateKey){
    throw new Error("Github Credentials is Missing!")
}

export const githubapp = new App({
    appId:appId,
    privateKey:privateKey
})

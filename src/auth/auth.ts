import { App } from "@octokit/app";
import { CustomError } from "../utils/constructor/error";

const appId = process.env.APP_ID;
const privateKey = process.env.PRIVATE_KEY;
if(!appId || privateKey ){
    throw new CustomError({
        message:"Github app missing credentials",
        statusCode:503
    })
}

export const githubapp = new App(
    {
        appId:appId,
        privateKey:privateKey!
    }
)
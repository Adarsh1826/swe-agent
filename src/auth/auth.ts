// import { App } from "@octokit/app";
// import { CustomError } from "../utils/constructor/error.js";

// const appId = process.env.APP_ID;
// const privateKey = process.env.PRIVATE_KEY;

// // console.log(appId);
// // console.log(privateKey);

// if (!appId || !privateKey) {
//   throw new CustomError({
//     message: "Github app missing credentials",
//     statusCode: 503,
//   });
// }

// export const githubapp = new App({
//   appId: appId,
//   privateKey: privateKey!,
// });


import { App } from "@octokit/app";
import { Octokit } from "@octokit/core";
import { restEndpointMethods } from "@octokit/plugin-rest-endpoint-methods";
import { CustomError } from "../utils/constructor/error.js";

const RestOctokit = Octokit.plugin(restEndpointMethods);

const appId = process.env.APP_ID;
const privateKey = process.env.PRIVATE_KEY;

if (!appId || !privateKey) {
  throw new CustomError({
    message: "Github app missing credentials",
    statusCode: 503,
  });
}

export const githubapp = new App({
  appId,
  privateKey,
  Octokit: RestOctokit,
});
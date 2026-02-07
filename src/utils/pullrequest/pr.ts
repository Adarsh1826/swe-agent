import { githubapp } from "../../auth/auth.js";
import path from "path";
import fs from "fs";
import { simpleGit } from "simple-git";

import { createAppAuth } from "@octokit/auth-app";


// Function to create a PR using GitHub App style
export async function createPRWithAppAuth({
  owner,
  repo,
  branchName,
  baseBranch = "main",
  title,
  body,
  installationId,
}: {
  owner: string;
  repo: string;
  branchName: string;
  baseBranch?: string;
  title: string;
  body: string;
  installationId: number;
}) {
  try {
    // 1️⃣ Get Octokit instance for this repo installation
    const octokit = await githubapp.getInstallationOctokit(installationId);

    // 2️⃣ Create the PR using raw request (old style)
    const response = await octokit.request(
      "POST /repos/{owner}/{repo}/pulls",
      {
        owner,
        repo,
        head: branchName,
        base: baseBranch,
        title,
        body,
      }
    );

    console.log("✅ PR created:", response.data.html_url);
    return response.data.number; // PR number
  } catch (err) {
    console.error("❌ Failed to create PR:", err);
    throw err;
  }
}



export async function getInstallationToken(installationId: number) {
  const auth = createAppAuth({
    appId: process.env.APP_ID!,
    privateKey: process.env.PRIVATE_KEY!,
  });

  const installationAuthentication = await auth({
    type: "installation",
    installationId,
  });

  return installationAuthentication.token;
}

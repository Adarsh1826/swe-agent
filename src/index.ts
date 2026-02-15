import "dotenv/config";
import { webhook } from "./webhook/webhook.js";
import fastify from "fastify";
import fs from "fs";

import installProjectDependency from "./scripts/run-shell.js";
import { collectRepoFiles } from "./utils/file-sys/index.js";
import { sendThisToGeminiForFileUpadtionAccoringtoIssue } from "./llm/gemini/gemini.js";
import path from "path";
import { createPRWithAppAuth } from "./utils/pullrequest/pr.js";
import { simpleGit } from "simple-git";

import { getInstallationToken } from "./utils/pullrequest/pr.js";

import { parseFileToAST } from "./tools/codecleaningtool/ast.js";
import { saveChunks } from "./tools/chunksaving/index.js";
import { ChunkTypes } from "./types/rag-types/index.js";

const app = fastify();

const port = parseInt(process.env.PORT!);

webhook.on("issues", async ({ payload }) => {
  console.log("Webhook sever hit");

  if (payload.action == "opened" || payload.action == "reopened") {
    // owner name
    const owner = payload.repository.owner.login;
    // repo name
    const repo = payload.repository.name;
    // label of the issue (here all label is covered)
    const labels = payload.issue.labels?.map((l) => l?.name);

    // author

    const author = payload.issue.user?.login;

    const issueData = {
      number: payload.issue.number,
      title: payload.issue.title,
      body: payload.issue.body || "",
      labels: labels,
      author: author,
      url: payload.issue.html_url,
    };

    console.log("Owner:", owner);
    console.log("Repo:", repo);
    console.log("Issue Data:", issueData);

    // here i will call the shell script

    const repoUrl = `https://github.com/${owner}/${repo}.git`;
    //const localRepoPath = `/tmp/repos/${repo}`;

    console.log(repoUrl);
    // here i am starting the project
    // await installProjectDependency(repoUrl);
    const localRepoPath = await installProjectDependency(repoUrl);

    // now i will call to get all files
    const allFilesContent = collectRepoFiles(localRepoPath);

    const filesForGemini = allFilesContent
      .split("\n\n// FILE: ")
      .slice(1) // first split is empty
      .map((chunk) => {
        const [filePath, ...contentArr] = chunk.split("\n");
        return { path: filePath.trim(), content: contentArr.join("\n") };
      });

    console.log(`Collected ${filesForGemini.length} files`);
    try {
      const geminiResponse =
        await sendThisToGeminiForFileUpadtionAccoringtoIssue({
          issue: `${issueData.title}\n\n${issueData.body}`, // FIX
          files: filesForGemini,
        });

      console.log("Gemini updated files:", geminiResponse.updatedFiles.length);
      console.log(geminiResponse.updatedFiles);

      if (!geminiResponse.updatedFiles.length) {
        console.log("No file updates from Gemini — skipping git & PR");
        return;
      }

      for (const file of geminiResponse.updatedFiles) {
        if (!file.path || !file.content) continue;

        const fullPath = path.join(localRepoPath, file.path);

        fs.mkdirSync(path.dirname(fullPath), { recursive: true });

        fs.writeFileSync(fullPath, file.content, "utf8");

        console.log("Wrote:", file.path);
      }

      const branchName = `issue-${issueData.number}-update`;
      const git = simpleGit(localRepoPath);

      const installationId = payload.installation?.id!;
      const token = await getInstallationToken(installationId);

      const authRepoUrl = `https://x-access-token:${token}@github.com/${owner}/${repo}.git`;

      await git.remote(["set-url", "origin", authRepoUrl]);

      await git.checkoutLocalBranch(branchName);

      // Stage ONLY changed files
      const paths = geminiResponse.updatedFiles.map((f) => f.path);
      await git.add(paths);

      await git.commit(`Auto-update files for issue #${issueData.number}`);

      await git.push("origin", branchName);

      console.log("Changes committed and pushed to branch:", branchName);

      const prNumber = await createPRWithAppAuth({
        owner,
        repo,
        branchName,
        title: `Fix: ${issueData.title}`,
        body: `Auto-updated files for issue #${issueData.number}\n\n${issueData.body}`,
        installationId,
      });

      console.log("PR successfully created. PR number:", prNumber);
    } catch (err) {
      console.error("Error updating files or creating PR:", err);
    } finally {
      try {
        if (localRepoPath) {
          await fs.promises.rm(localRepoPath, {
            recursive: true,
            force: true,
          });
          console.log("Cleaned ", localRepoPath);
        }
      } catch (error) {
        console.error("Cleanup failed:", error);
      }
    }
  }
});

// for testing server is up or not

app.get("/health", (req, res) => {
  res.send({
    status: "running",
  });
});

// for webhook endpoint
app.post("/webhook", async (req, reply) => {
  try {
    const payload = Buffer.isBuffer(req.body)
      ? req.body.toString("utf8")
      : JSON.stringify(req.body);

    await webhook.verifyAndReceive({
      id: req.headers["x-github-delivery"] as string,
      name: req.headers["x-github-event"] as string,
      payload,
      signature: req.headers["x-hub-signature-256"] as string,
    });

    reply.send({ ok: true });
  } catch (err) {
    console.error("Webhook verification error:", err);
    reply.code(401).send({ error: "Invalid webhook" });
  }
});

app.listen({ port: port, host: "0.0.0.0" }, async () => {
  console.log(`Server is listening on http://localhost:${port}`);
});

// async function buildChunks() {
//   const chunks: ChunkTypes[] = [];

//   await parseFileToAST("./src", chunks);

//   console.log("Chunks created:", chunks.length);

//   await saveChunks(chunks);
// }

// buildChunks();

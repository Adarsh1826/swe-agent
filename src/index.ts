import 'dotenv/config';
import { webhook } from './webhook/webhook';
import runGitCloneShellScript from './scripts/run-shell';
import fastify from "fastify";
import fs from "fs";

const app = fastify()

const port = parseInt(process.env.PORT!);


webhook.on('issues', async ({ payload }) => {
  console.log("Webhook sever hit")

  

  if (payload.action == "opened" || payload.action == "reopened") {
    // owner name
    const owner = payload.repository.owner.login;
    // repo name
    const repo = payload.repository.name;
    // label of the issue (here all label is covered)
    const labels = payload.issue.labels?.map(l => l?.name);

    // author

    const author = payload.issue.user?.login;

    const issueData = {
      number: payload.issue.number,
      title: payload.issue.title,
      body: payload.issue.body || "",
      labels: labels,
      author: author,
      url: payload.issue.html_url
    };

    console.log("Owner:", owner);
    console.log("Repo:", repo);
    console.log("Issue Data:", issueData);


    // here i will call the shell script

    const repoUrl = `https://github.com/${owner}/${repo}.git`;

    console.log(repoUrl);

    runGitCloneShellScript(repoUrl)

    // debuuging logs

    
    




  }
})


// for testing server is up or not

app.get('/health', (req, res) => {
  res.send({
    "status": "running"
  })
})

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
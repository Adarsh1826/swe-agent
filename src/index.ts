import "dotenv/config";
import { webhook } from "./webhook/webhook.js";
import fastify from "fastify";
import installProjectDependencyAndStartProject from "./scripts/run-shell.js";
import { GITHUB_REPO_URL } from "./links.js";
import fastifyFormbody from "@fastify/formbody";
import apiRoutes from "./http/user/routes/route.js";
import { prisma } from "./utils/db/db.js";
const app = fastify();
// route regiter
app.register(apiRoutes);

app.register(fastifyFormbody)

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

    // now i will save the user data in db if not exist

    let user= await prisma.user.findFirst({
      where:{
        githubId:payload.sender.id
      }
    })
    
    if(user){
      // means not exist
      user = await prisma.user.create({
        data:{
          githubId:payload.sender.id,
          username : payload.sender.login,
          avatarUrl:payload.sender.avatar_url,
          profileUrl:payload.sender.html_url,
        }
      })
      console.log(user);
      
    }
    // now i will for for this id is repo exist in job queue or not 

    // now check correspoing job exist in the db or not

    let job = await  prisma.job.findFirst({
      where:{
        repoUrl: `${GITHUB_REPO_URL}/${owner}/${repo}`,
        issueNumber:issueData.number
      }
    })
    
    // agar same issue number se hai tb nhi lena hai

    if(!job){
      job= await prisma.job.create({
        data:{
          repoUrl: `${GITHUB_REPO_URL}/${owner}/${repo}`,
          status:"PENDING",
          issueNumber:issueData.number,
          userId:user?.id,
          guestId:"NULL",
        }
      })
    }

    console.log("Job saved sucessfully into the table");
    
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


import 'dotenv/config';
import { webhook } from './webhook/webhook';
import fastify from "fastify";

const app = fastify()

const port = parseInt(process.env.PORT!);


webhook.on('issues',async({payload})=>{
    console.log("Webhook sever hit")

    if(payload.action=="opened" || payload.action=="reopened"){
        const owner = payload.repository.owner.login
        const repo = payload.repository.name
        const issues = payload.issue

        console.log(owner);
        console.log(repo);
        console.log(issues);
        
        
        
    }
})


// for testing server is up or not

app.get('/health',(req,res)=>{
    res.send({
        "status":"running"
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
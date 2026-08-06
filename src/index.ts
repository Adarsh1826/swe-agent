import Fastify from "fastify";

const app = Fastify();

app.get("/", async () => {
  return { status: "OK" };
});

const PORT = Number(process.env.PORT) || 3000;

app.listen({ port: PORT, host: "0.0.0.0" })
  .then(() => {
    console.log(`Server running on ${PORT}`);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
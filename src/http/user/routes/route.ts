// import { FastifyInstance } from "fastify";
// import { addApiKey } from "../apis/api.js";


// export default async function apiRoutes(app: FastifyInstance) {
//   app.post("/addApiKey", addApiKey);
// }

import { FastifyInstance } from "fastify";
import { addApiKey } from "../apis/api.js";
import { getUserApiKeys } from "../apis/get.js";
import { deleteUserApiKey } from "../apis/delete.js";

export default async function apiRoutes(app: FastifyInstance) {

  // Add API Key
  app.post("/addApiKey", addApiKey);

  // Get User / Guest API Keys
  app.get("/getUserApiKeys", getUserApiKeys);

  // Delete API Key
  app.delete("/deleteApiKey/:id", deleteUserApiKey);
}

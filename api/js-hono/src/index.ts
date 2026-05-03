import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import router from "./routes";

const app = new Hono();

app.use('*', logger());
app.use('*', prettyJSON());

app.get("/api/v1/health", (c) => {
  return c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "js-hono",
  });
});

app.route('/api/v1', router);

app.notFound((c) => c.json({ message: "Not Found" }, 404));
app.onError((err, c) => {
  console.error(err);
  return c.json({ message: err.message }, 500);
});

const server = serve({ fetch: app.fetch, port: 3000 }, (info) => {
  console.log(`Server running at http://localhost:${info.port}`);
});

process.on('SIGINT', () => {
  server.close()
  process.exit(0)
})
process.on('SIGTERM', () => {
  server.close((err) => {
    if (err) {
      console.error(err)
      process.exit(1)
    }
    process.exit(0)
  })
})

export default app;

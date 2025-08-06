import { config } from "../config.js";
export async function handlerReadiness(_, res) {
    res.set("Content-Type", "text/plain; charset=utf-8");
    res.status(200).send("OK");
    res.end();
}
export async function handlerMetrics(_, res) {
    res.set("Content-Type", "text/html; charset=utf-8");
    res.send(`
  <html>
    <body>
      <h1>Welcome, Chirpy Admin</h1>
      <p>Chirpy has been visited ${config.fileserverHits} times!</p>
    </body>
  </html>
  `);
    res.end();
}
export async function handlerReset(_, res) {
    config.fileserverHits = 0;
    res.write("Hits reset to 0");
    res.end();
}

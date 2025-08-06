import { config } from "../config.js";
import { respondWithError, respondWithJSON } from "./json.js";
export function handlerReadiness(_, res) {
    res.set("Content-Type", "text/plain; charset=utf-8");
    res.status(200).send("OK");
    res.end();
}
export function handlerMetrics(_, res) {
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
export function handlerReset(_, res) {
    config.fileserverHits = 0;
    res.write("Hits reset to 0");
    res.end();
}
export async function handlerChirpsValidate(req, res) {
    let body = "";
    req.on("data", (chunk) => {
        body += chunk;
    });
    let params;
    req.on("end", () => {
        try {
            params = JSON.parse(body);
        }
        catch (e) {
            respondWithError(res, 400, "Invalid JSON");
            return;
        }
        const maxChirpLength = 140;
        if (params.body.length > maxChirpLength) {
            respondWithError(res, 400, "Chirp is too long");
            return;
        }
        respondWithJSON(res, 200, {
            valid: true,
        });
    });
}

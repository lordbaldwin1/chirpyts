export function handlerReadiness(req, res) {
    res.header("Content-Type", "text/plain; charset=utf-8");
    res.send("OK");
}

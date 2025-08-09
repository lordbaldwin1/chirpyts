# Web Server in TS Notes

## Async TypeScript
- JS servers are typically single-threaded
- Still handles many requests at once via async event loop.
- It's only an issue with CPU-intensive work because event loop clogged

- Complexity is lowered with single-threaded server.

Here's an example of an sync operation in TS:
```TS
async function fetchUserData(userId: number): Promise<User> {
  const res = await fetch(`https://api.example.com/user/${userId}`);
  return res.json();
}
```
Explanation:
- `async/await` let's us write code that looks synchronous by pausing execution on await.
- `Promises` represent the eventual success/failure of the operation
- *Error Handling*: Use try/catch blocks

*tsconfig.json*
`rootDir` is where your TypeScript files are located
`outDir` is where your compiled JavaScript files will go (you won't modify these - they're generated from your TypeScript files)
`include` specifies the files to include in the compilation
`exclude` specifies the files to exclude from the compilation
`strict` enables all strict type checking options
`esModuleInterop` allows you to use ES module syntax
`moduleResolution` specifies how modules are resolved
`skipLibCheck` skips type checking all declaration files
`baseUrl` allows you to use paths relative to the project root

## Fileserver in Express
```TS
const app = express();
const PORT = 8080;

app.use(express.static("."));

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
```
`app.use(express.static("."));` tells express to server static files from the current directory.
`app.listen` starts the server and listens for incoming connections on the specified port.
- `index.html` is so common that express automatically serves it from the root directory `/` instead of `/index.html` route.
- Standard file servers map the path to a file on disk to the URL path.

## Custom Handlers
```TS
(req: Request, res: Response) => Promise<void>;
```
This is the typical signature of an HTTP handler in Express.

## JSON

Decode JSON Request Body

We can manually read this body using Node.js streams.
- Initialize a string buffer
- Listen for 'data' events
- Listen for 'end' events

```TS
async function handler(req: Request, res: Response) {
  let body = ""; // 1. Initialize

  // 2. Listen for data events
  req.on("data", (chunk) => {
    body += chunk;
  });

  // 3. Listen for end events
  req.on("end", () => {
    try {
      const parsedBody = JSON.parse(body);
      // now you can use `parsedBody` as a JavaScript object
      // ...
    } catch (error) {
      res.status(400).send("Invalid JSON");
    }
  });
}
```

Encode JSON Response Body

Just stringify the JS object and use the res.send() method
```TS
async function handler(req: Request, res: Response) {
  type responseData = {
    createdAt: string;
    ID: number;
  };

  const respBody: responseData = {
    createdAt: new Date().toISOString(),
    ID: 123,
  };

  res.header("Content-Type", "application/json");
  const body = JSON.stringify(respBody);
  res.status(200).send(body);
  res.end();
}
```

## JSON Middleware
```TS
app.use(express.json());
```
Using this, Express will automatically:
- Check if `Content-Type` header is set to `application/json`
- Parse the request into `req.body`
- Handle errors for malformed JSON
So instead of the hell we experiences before req.on('data',....):
```TS
async function handler(req: Request, res: Response) {
  type parameters = {
    body: string;
  };

  // req.body is automatically parsed
  const params: parameters = req.body;
  // ...
}
```

## Useful response functions:
```TS
import type { Response } from "express";

export function respondWithError(res: Response, code: number, message: string) {
  respondWithJSON(res, code, { error: message });
}

export function respondWithJSON(res: Response, code: number, payload: any) {
  res.header("Content-Type", "application/json");
  const body = JSON.stringify(payload);
  res.status(code).send(body);
  res.end();
}
```

## Error-Handling Middleware in Express
Has four parameters `(err, req, res, next)`
- Synchronous errors (thrown in your route handlers) automatically skip normal middleware and go straight to this error handler.
- Asynchronous errors (in async functions) must be caught or passed to next(err) so they can also be handled here.

YOU MUST DEFINE ERROR HANDLING MIDDLEWARE LAST AFTER OTHER `app.use()` and routes.
```TS
function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  console.error("Uh oh, spaghetti-o");
  res.status(500).json({
    error: "Boots has fallen",
  });
}

app.use(errorHandler);
```

In Express 4, unhandled async errors don't automatically go to the error handler, you need to:
```TS
app.post("/api", async (req, res, next) => {
  try {
    await handler(req, res);
  } catch (err) {
    next(err); // Pass the error to Express
  }
});
```
Or you can use promises with `.catch(next)`
```TS
app.post("/api", (req, res, next) => {
  Promise.resolve(handler(req, res)).catch(next);
});
```

## Drizzle
`$onUpdate` sets the field to a default value whenever the row is updated
`$inferInsert` is a helper type that infers the type of the object you would pass to the insert function.

## Authentication w/ Password
- check `auth.ts` file

## JWT notes
Using jsonwebtoken library
- `jwt.sign(payload, secret, [options])` to make a JWT

## MORE EXPRESS NOTES
- you don't even need to set content type or JSON.stringify your objects
- express just does this automatically for us when res.send(object). WHAT THE HECK!? TY EXPRESS
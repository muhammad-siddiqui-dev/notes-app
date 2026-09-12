import { generateKeyPairSync } from "node:crypto";
import { createServer } from "http";
import { promisify } from "util";

function generateRS256KeyPair() {
  const { publicKey, privateKey } = generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: { type: "spki", format: "pem" },
    privateKeyEncoding: { type: "pkcs8", format: "pem" }
  });
  return { publicKey, privateKey };
}

function jwkFromPublicKey(pem: string) {
  const key = require("crypto").publicKeyFromPem(pem);
  const jwk = require("crypto").publicKeyExportJWK(key);
  return jwk;
}

function startJwksServer(privateKeyPem: string) {
  const { publicKey: pk } = generateRS256KeyPairFromPem(privateKeyPem);

  const jwk = jwkFromPublicKey(pk);

  return new Promise((resolve) => {
    const http = require("http");
    const server = http.createServer((req: any, res: any) => {
      const url = req.url || "";
      if (url === "/.well-known/jwks.json" && req.method === "GET") {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ keys: [jwk] }));
      } else {
        res.writeHead(404);
        res.end("Not Found");
      }
    });

    const port = 34567 + Math.floor(Math.random() * 1000);
    server.listen(port, () => {
      resolve({ port, baseUrl: `http://localhost:${port}` });
    });
  });
}

function generateRS256KeyPairFromPem(privateKeyPem: string) {
  const { publicKey } = generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: { type: "spki", format: "pem" },
    privateKeyEncoding: { type: "pkcs8", format: "pem" }
  });
  return { publicKey: publicKey };
}
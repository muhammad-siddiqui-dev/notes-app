import { existsSync } from "node:fs";
import { loadEnvFile } from "node:process";
import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";

if (existsSync(".env")) {
  loadEnvFile(".env");
}

export interface AuthenticatedRequest {
  headers?: { authorization?: string; get?: (_name: string) => string | null };
  user?: {
    id: string;
    email?: string;
  };
}

export interface RequestWithAuth {
  headers?: { authorization?: string; get?: (_name: string) => string | null };
  user?: AuthenticatedRequest["user"];
}

const jwksClients = new Map<string, ReturnType<typeof jwksClient>>();

function getJwksClient(jwksUri: string) {
  if (!jwksClients.has(jwksUri)) {
    jwksClients.set(
      jwksUri,
      jwksClient({
        jwksUri,
        cache: true,
        cacheMaxAge: 10 * 60 * 1000,
        rateLimit: true,
        jwksRequestsPerMinute: 10,
      })
    );
  }
  return jwksClients.get(jwksUri)!;
}

function getSigningKey(jwksUri: string, kid: string): Promise<string> {
  const client = getJwksClient(jwksUri);
  return new Promise((resolve, reject) => {
    client.getSigningKey(kid, (err, key) => {
      if (err || !key) {
        reject(new Error(`JWKS key resolution failed for kid=${kid}: ${err?.message || "key not found"}`));
      } else {
        resolve(key.getPublicKey());
      }
    });
  });
}

export const authenticateOAuth2 = async (
  req: RequestWithAuth,
  next?: () => void
): Promise<void> => {
  const authHeader = req.headers?.authorization || req.headers?.get?.("authorization");

  if (!authHeader || !(typeof authHeader === "string" && authHeader.startsWith("Bearer "))) {
    console.error(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: "error",
        user_id: null,
        message: "Authentication required: missing or invalid Bearer token",
        component: "auth-middleware"
      })
    );
    return;
  }

  const provider = process.env.OAUTH_PROVIDER || "";
  const clientId = process.env.OAUTH_CLIENT_ID || "";
  const clientSecret = process.env.OAUTH_CLIENT_SECRET || "";
  const jwtIssuer = process.env.JWT_ISSUER || provider;
  const jwtAudience = process.env.JWT_AUDIENCE || clientId;
  const jwksUri = process.env.OAUTH_JWKS_URL;

  if (!provider || provider.trim().length === 0) {
    console.error(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: "error",
        user_id: null,
        message: "OAuth provider not configured: .env OAUTH_PROVIDER must be set (production auth framework — real provider settings required)",
        component: "auth-middleware"
      })
    );
    return;
  }

  if (!jwksUri || jwksUri.trim().length === 0) {
    console.error(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: "error",
        user_id: null,
        message: "JWKS endpoint not configured: .env OAUTH_JWKS_URL must be set for RS256 verification",
        component: "auth-middleware"
      })
    );
    return;
  }

  const token = (authHeader as string).replace("Bearer ", "").trim();
  if (!token || token.trim().length === 0) {
    console.error(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: "error",
        user_id: null,
        message: "Authentication failed: empty Bearer token after extraction",
        component: "auth-middleware"
      })
    );
    return;
  }

  try {
    const unverifiedHeader = jwt.decode(token, { complete: true });
    if (!unverifiedHeader || typeof unverifiedHeader === "string" || !unverifiedHeader.header.kid) {
      throw new Error("Invalid JWT: missing key id (kid) in header");
    }

    const kid = unverifiedHeader.header.kid;
    const signingKey = await getSigningKey(jwksUri, kid);

    const decoded = jwt.verify(token, signingKey, {
      algorithms: ["RS256"],
      issuer: jwtIssuer,
      audience: jwtAudience,
      clockTolerance: 30,
    }) as { sub: string; iss?: string; aud?: string | string[]; exp?: number; iat?: number; email?: string; alg?: string };

    if (!decoded.sub || typeof decoded.sub !== "string" || decoded.sub.trim().length === 0) {
      throw new Error("Invalid JWT: missing or empty sub claim");
    }

    const verifiedSub = decoded.sub;

    (req as RequestWithAuth).user = {
      id: verifiedSub,
      email: decoded.email || undefined
    };

    console.log(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: "info",
        user_id: verifiedSub,
        message: "OAuth2/OIDC authentication successful — verified sub claim: " + verifiedSub,
        component: "auth-middleware"
      })
    );

    if (next) next();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: "error",
        user_id: null,
        message: "Authentication failed: " + message,
        component: "auth-middleware"
      })
    );
  }
};

export function clearJwksClientCache() {
  jwksClients.clear();
}
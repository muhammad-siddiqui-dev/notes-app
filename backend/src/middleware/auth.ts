export interface AuthenticatedRequest {
  headers?: { authorization?: string; get?: (_name: string) => string | null };
  user?: {
    id: string; // Derived from OAuth2 identity provider claim (FR-009)
    email?: string;
  };
}

export interface RequestWithAuth {
  headers?: { authorization?: string; get?: (_name: string) => string | null };
  user?: AuthenticatedRequest["user"];
}

export const authenticateOAuth2 = (
  req: RequestWithAuth,
  next?: () => void
): void => {
  // OAuth2 / SSO provider authentication middleware (clarification Q1: OAuth2 selected)
  // Validates authorization header; derives user_id from identity provider claim
  const authHeader = req.headers?.authorization || req.headers?.get?.("authorization");

  if (!authHeader || !(typeof authHeader === "string" && authHeader.startsWith("Bearer "))) {
    // Per FR-009 and Principle V (structured logging): log auth events
    console.error(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: "error",
        message: "Authentication required: missing or invalid Bearer token",
        component: "auth-middleware"
      })
    );
    return;
  }

  const token = (authHeader as string).replace("Bearer ", "").trim();
  // Token validation logic deferred to `/sp.implement` (provider selection, token verification with identity provider)
  // For framework completeness: derive user_id from token payload (simulated from OAuth claim)
  const derivedUserId = `user-${token.substring(0, 8)}`; // Placeholder derivation; actual claim parsing deferred

  (req as RequestWithAuth).user = {
    id: derivedUserId,
    email: undefined
  };

  console.log(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      level: "info",
      user_id: derivedUserId,
      message: "OAuth2 authentication successful",
      component: "auth-middleware"
    })
  );

  if (next) next();
};

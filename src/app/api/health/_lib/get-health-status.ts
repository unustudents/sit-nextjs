const REQUIRED_ENV_KEYS = [
  "SUPABASE_URL",
  "SUPABASE_PUBLISHABLE_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
] as const;

export type HealthStatus = {
  status: "healthy" | "degraded";
  service: string;
  timestamp: string;
  checks: {
    supabaseConfigured: boolean;
  };
};

export function getHealthStatus(): HealthStatus {
  const supabaseConfigured = REQUIRED_ENV_KEYS.every((key) =>
    Boolean(process.env[key]),
  );

  return {
    status: supabaseConfigured ? "healthy" : "degraded",
    service: "sit",
    timestamp: new Date().toISOString(),
    checks: { supabaseConfigured },
  };
}

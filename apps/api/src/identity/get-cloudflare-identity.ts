import { err, ok, type Result } from "@finapp/result";

interface Env {
  TEAM_DOMAIN: string;
}

interface BadGateway {
  _tag: "BadGateway";
}

export async function getCloudflareIdentity(
  token: string,
  env: Env,
): Promise<Result<CloudflareAccessIdentity, BadGateway>> {
  const url = `${env.TEAM_DOMAIN}/cdn-cgi/access/get-identity`;

  let response: Response;

  try {
    response = await fetch(url, {
      method: "GET",
      headers: {
        Cookie: `CF_Authorization=${token}`,
        Accept: "application/json",
      },
    });
  } catch {
    return err("BadGateway");
  }

  if (!response.ok) return err("BadGateway");

  let data: unknown;

  try {
    data = await response.json();
  } catch {
    return err("BadGateway");
  }

  return ok(data as CloudflareAccessIdentity);
}

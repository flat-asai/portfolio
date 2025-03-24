// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const basicAuth = req.headers.get("authorization");
  const user = process.env.BASIC_AUTH_USER;
  const pass = process.env.BASIC_AUTH_PASS;

  if (basicAuth) {
    const [scheme, encoded] = basicAuth.split(" ");
    if (scheme === "Basic") {
      const buff = Buffer.from(encoded, "base64").toString();
      const [username, password] = buff.split(":");

      if (username === user && password === pass) {
        return NextResponse.next();
      }
    }
  }

  console.log(process.env.BASIC_AUTH_USER);

  const res = new NextResponse("Unauthorized", { status: 401 });
  res.headers.set("WWW-Authenticate", 'Basic realm="Secure Area"');
  return res;
}

export const config = {
  matcher: ["/((?!_next|.*\\..*|api).*)"],
};

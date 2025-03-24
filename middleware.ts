import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  // 開発環境やプレビュー環境では認証をスキップするオプション
  const isVercelPreview = process.env.VERCEL_ENV === "preview";
  if (process.env.NODE_ENV === "development" || isVercelPreview) {
    return NextResponse.next();
  }

  const basicAuth = req.headers.get("authorization");
  const user = process.env.BASIC_AUTH_USER;
  const pass = process.env.BASIC_AUTH_PASS;

  if (!user || !pass) {
    console.error("Basic認証の環境変数が設定されていません");
    return NextResponse.next();
  }

  if (basicAuth) {
    const [scheme, encoded] = basicAuth.split(" ");
    if (scheme === "Basic") {
      try {
        const decoded = Buffer.from(encoded, "base64").toString("utf-8");
        const [username, password] = decoded.split(":");

        if (username === user && password === pass) {
          return NextResponse.next();
        }
      } catch (error) {
        console.error("認証デコードエラー:", error);
      }
    }
  }

  return new NextResponse("Unauthorized", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Secure Area"',
    },
  });
}

export const config = {
  matcher: [
    // APIルートとNext.jsの内部パスを除外
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).+)",
  ],
};

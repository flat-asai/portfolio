import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const config = {
  matcher: "/((?!api|_next/static|_next/image|favicon.ico).*)",
};

export default function middleware(request: NextRequest) {
  const authorizationHeader = request.headers.get("authorization");

  // 環境変数が正しく設定されているか確認
  const user = process.env.BASIC_AUTH_USER;
  const pass = process.env.BASIC_AUTH_PASS;

  // 環境変数がない場合は認証をスキップ（開発環境用）
  if (!user || !pass) {
    console.warn("Basic auth credentials not found in environment variables");
    return NextResponse.next();
  }

  if (authorizationHeader) {
    const basicAuth = authorizationHeader.split(" ")[1];
    const decodedAuth = atob(basicAuth).split(":");

    if (decodedAuth.length === 2) {
      const [authUser, authPass] = decodedAuth;

      if (authUser === user && authPass === pass) {
        return NextResponse.next();
      }
    }
  }

  // 認証失敗時のレスポンス
  return new NextResponse("Basic Auth Required", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Secure Area"',
    },
  });
}

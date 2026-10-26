import { headers } from "next/headers";

export type CurrentUser = {
  name: string;
  username: string;
  email: string;
};

// crm.delvrio.com 은 앞단(Traefik forwardAuth → bbb 계정 SSO)이 로그인을 확인하고
// X-Auth-* 헤더로 사용자를 넘긴다. 로컬 개발처럼 헤더가 없으면 null.
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const requestHeaders = await headers();
  const username = requestHeaders.get("x-auth-username");
  if (!username) return null;
  const rawName = requestHeaders.get("x-auth-user") ?? username;
  let name = rawName;
  try {
    name = decodeURIComponent(rawName);
  } catch {
    name = rawName;
  }
  return { name, username, email: requestHeaders.get("x-auth-email") ?? "" };
}

// bbb 계정 로그아웃(공유 쿠키 삭제). 같은 도메인의 /admin 은 bbb dcore 로 간다.
export const LOGOUT_URL = "/admin/logout/";

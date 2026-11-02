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

// bbb 계정 로그아웃(공유 쿠키 삭제). 로그인 창구 login.delvrio.com(bbb dcore)에서 하고,
// 다시 로그인하면 crm 으로 돌아온다.
export const LOGOUT_URL = "https://login.delvrio.com/admin/logout/?next=https%3A%2F%2Fcrm.delvrio.com%2F";

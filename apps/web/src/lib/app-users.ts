import { headers } from "next/headers";

export type AppUser = {
  id: number;
  username: string;
  name: string;
  email: string;
  is_superuser: boolean;
  is_staff: boolean;
  in_group: boolean;
  last_login: string | null;
};

export type AppUsers = {
  app: string;
  group: string | null;
  group_id: number | null;
  can_manage: boolean;
  users: AppUser[];
};

// crm 사용자 = bbb 계정 중 crm 사용 권한이 있는 사람(bbb navigation_apps 의 crm 행 그룹 + superuser).
// 서버에서 지금 사용자의 공유 로그인 쿠키(dlv_sso)를 실어 bbb dcore 에 묻는다(클러스터 내부 주소).
const BBB_CORE_URL =
  process.env.BBB_CORE_URL ?? "http://core-service.bbb-namespace.svc.cluster.local:8000";

export async function getAppUsers(): Promise<AppUsers | null> {
  const cookie = (await headers()).get("cookie");
  if (!cookie) return null;
  try {
    const response = await fetch(`${BBB_CORE_URL}/api/core/auth/app-users/?app=crm`, {
      headers: { cookie },
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) return null;
    return (await response.json()) as AppUsers;
  } catch {
    return null;
  }
}

// bbb Admin 화면. crm 도메인의 /admin 은 bbb dcore 로 간다(bbb infra/k8s/v1.0/crm-auth-ingress.yaml).
export const BBB_USER_ADMIN_URL = "/admin/accounts/user/";

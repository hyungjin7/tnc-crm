import { ExternalLink, UserPlus, UserRound } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BBB_USER_ADMIN_URL, getAppUsers } from "@/lib/app-users";

// 사용자·권한: crm 은 따로 사용자를 만들지 않는다. bbb 계정에 crm 그룹을 넣으면 쓸 수 있다.
export async function UsersSection() {
  const data = await getAppUsers();
  if (!data) {
    return (
      <Card className="border-dashed">
        <CardContent className="text-sm leading-6 text-muted-foreground">
          bbb 사용자 목록을 불러오지 못했습니다. 잠시 뒤 다시 열어 주세요.
        </CardContent>
      </Card>
    );
  }

  const groupListUrl = data.group_id
    ? `${BBB_USER_ADMIN_URL}?groups__id__exact=${data.group_id}`
    : BBB_USER_ADMIN_URL;

  return (
    <>
      {data.can_manage ? (
        <div className="grid grid-cols-2 gap-2">
          <Button asChild>
            <a href={BBB_USER_ADMIN_URL}>
              <UserPlus /> bbb 사용자에서 추가
            </a>
          </Button>
          <Button asChild variant="outline">
            <a href={groupListUrl}>
              <ExternalLink /> {data.group ?? "전체"} 그룹 보기
            </a>
          </Button>
        </div>
      ) : null}
      <Card className="gap-0 py-0">
        <CardContent className="divide-y px-0">
          {data.users.map((user) => {
            const role = user.is_superuser ? "관리자" : "사용자";
            const row = (
              <>
                <div className="flex size-9 items-center justify-center rounded-full bg-muted">
                  <UserRound className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{user.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{user.email || user.username}</p>
                </div>
                <Badge variant={user.is_superuser ? "default" : "outline"}>{role}</Badge>
              </>
            );
            return data.can_manage ? (
              <a
                key={user.id}
                href={`${BBB_USER_ADMIN_URL}${user.id}/change/`}
                className="flex items-center gap-3 px-4 py-4 transition-colors hover:bg-muted/50"
              >
                {row}
              </a>
            ) : (
              <div key={user.id} className="flex items-center gap-3 px-4 py-4">
                {row}
              </div>
            );
          })}
        </CardContent>
      </Card>
      <Card className="border-dashed">
        <CardContent className="text-sm leading-6 text-muted-foreground">
          {data.group ? (
            <>
              crm 사용자는 bbb 계정입니다. bbb 사용자 화면에서 사람을 고르고 그룹에 <b>{data.group}</b>을(를) 넣으면 바로
              쓸 수 있고, 빼면 못 들어옵니다. bbb 계정이 없으면 먼저 추가하세요(로그인하려면 스태프 권한 필요).
              관리자(superuser)는 그룹과 상관없이 들어옵니다.
            </>
          ) : (
            <>사용 그룹이 정해지지 않아 bbb 계정 전원이 쓸 수 있습니다.</>
          )}
        </CardContent>
      </Card>
    </>
  );
}

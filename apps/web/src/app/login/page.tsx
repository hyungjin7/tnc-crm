import { Building2, LogIn, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <div className="flex min-h-[calc(100svh-2rem)] flex-col justify-between px-6 py-10">
      <div className="flex justify-center">
        <div className="flex size-12 items-center justify-center rounded-xl bg-foreground text-background">
          <Building2 className="size-6" />
        </div>
      </div>
      <div className="space-y-8 text-center">
        <div>
          <p className="text-sm font-semibold text-muted-foreground">트루노스크루</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">영업 자동화 대시보드</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            bbb 계정으로 로그인해 오늘 처리할 영업 업무를 확인하세요.
          </p>
        </div>
        <Card>
          <CardContent className="space-y-4">
            <Button asChild size="lg" className="w-full">
              {/* crm.delvrio.com 은 bbb 계정 공유 로그인(SSO)을 쓴다 — /admin 은 bbb 로그인 화면(dcore) */}
              <a href="/admin/login/?next=/"><LogIn /> bbb 계정으로 계속하기</a>
            </Button>
            <div className="flex items-start gap-2 text-left text-xs leading-5 text-muted-foreground">
              <ShieldCheck className="mt-0.5 size-4 shrink-0" />
              계정과 사용 권한(crm 그룹)은 bbb Admin › 사용자에서 관리합니다.
            </div>
          </CardContent>
        </Card>
      </div>
      <p className="text-center text-xs text-muted-foreground">bbb 계정 공유 로그인</p>
    </div>
  );
}

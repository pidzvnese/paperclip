import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "@/lib/router";
import { useCompany } from "../context/CompanyContext";
import { useDialog } from "../context/DialogContext";
import { useBreadcrumbs } from "../context/BreadcrumbContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users, CircleDot } from "lucide-react";

export function QuickStartPage() {
  const { t } = useTranslation();
  const { setBreadcrumbs } = useBreadcrumbs();
  const { selectedCompanyId, companies } = useCompany();
  const selectedCompany = companies.find((c) => c.id === selectedCompanyId);
  const { openOnboarding, openNewAgent, openNewIssue } = useDialog();

  useEffect(() => {
    setBreadcrumbs([{ label: t("quickStart.title") }]);
  }, [setBreadcrumbs, t]);

  const hasWorkspace = companies.length > 0;
  const hasCompanySelected = !!selectedCompanyId;

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">{t("quickStart.title")}</h1>
        <p className="mt-1 text-muted-foreground">{t("quickStart.subtitle")}</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                1
              </span>
              <CardTitle className="text-base">{t("quickStart.step1Title")}</CardTitle>
            </div>
            <CardDescription>{t("quickStart.step1Desc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => openOnboarding()} variant="outline" size="sm">
              <Building2 className="mr-1.5 h-4 w-4" />
              {t("quickStart.step1Action")}
            </Button>
          </CardContent>
        </Card>

        <Card className={!hasWorkspace ? "opacity-70" : undefined}>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                2
              </span>
              <CardTitle className="text-base">{t("quickStart.step2Title")}</CardTitle>
            </div>
            <CardDescription>{t("quickStart.step2Desc")}</CardDescription>
          </CardHeader>
          <CardContent>
            {hasCompanySelected ? (
              <Button onClick={() => openNewAgent()} variant="outline" size="sm">
                <Users className="mr-1.5 h-4 w-4" />
                {t("quickStart.step2Action")}
              </Button>
            ) : (
              <p className="text-sm text-muted-foreground">
                {hasWorkspace
                  ? t("quickStart.selectWorkspaceFirst")
                  : t("quickStart.completeStep1First")}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className={!hasCompanySelected ? "opacity-70" : undefined}>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                3
              </span>
              <CardTitle className="text-base">{t("quickStart.step3Title")}</CardTitle>
            </div>
            <CardDescription>{t("quickStart.step3Desc")}</CardDescription>
          </CardHeader>
          <CardContent>
            {hasCompanySelected ? (
              <Button onClick={() => openNewIssue()} variant="outline" size="sm">
                <CircleDot className="mr-1.5 h-4 w-4" />
                {t("quickStart.step3Action")}
              </Button>
            ) : (
              <p className="text-sm text-muted-foreground">
                {hasWorkspace
                  ? t("quickStart.selectWorkspaceFirst")
                  : t("quickStart.completeStep1First")}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="rounded-lg border border-border bg-muted/30 p-4">
        <p className="text-sm text-muted-foreground">
          {t("quickStart.tip")}
        </p>
        <Button asChild variant="link" className="mt-2 h-auto p-0 text-primary">
          <Link to={selectedCompany?.issuePrefix ? `/${selectedCompany.issuePrefix}/dashboard` : "/"}>
            {t("quickStart.goToDashboard")}
          </Link>
        </Button>
      </div>
    </div>
  );
}

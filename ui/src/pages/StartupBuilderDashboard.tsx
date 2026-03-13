import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { useCompany } from "../context/CompanyContext";
import { useBreadcrumbs } from "../context/BreadcrumbContext";
import { startupBuilderApi } from "../api/startup-builder";
import { dashboardApi } from "../api/dashboard";
import { issuesApi } from "../api/issues";
import { activityApi } from "../api/activity";
import { queryKeys } from "../lib/queryKeys";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, ListTodo, History, BarChart3 } from "lucide-react";
import { Link } from "@/lib/router";

export function StartupBuilderDashboard() {
  const { t } = useTranslation();
  const { selectedCompanyId, companies } = useCompany();
  const { setBreadcrumbs } = useBreadcrumbs();
  const company = companies.find((c) => c.id === selectedCompanyId);

  const { data: profile } = useQuery({
    queryKey: ["startup-builder", "profile", selectedCompanyId],
    queryFn: () => startupBuilderApi.getProfile(selectedCompanyId!),
    enabled: !!selectedCompanyId,
  });

  const { data: dashboardSummary } = useQuery({
    queryKey: queryKeys.dashboard(selectedCompanyId!),
    queryFn: () => dashboardApi.summary(selectedCompanyId!),
    enabled: !!selectedCompanyId,
  });

  const { data: issuesList } = useQuery({
    queryKey: queryKeys.issues.list(selectedCompanyId!),
    queryFn: () => issuesApi.list(selectedCompanyId!),
    enabled: !!selectedCompanyId,
  });
  const recentIssues = issuesList?.slice(0, 5) ?? [];

  const { data: activityList } = useQuery({
    queryKey: ["activity", selectedCompanyId],
    queryFn: () => activityApi.list(selectedCompanyId!),
    enabled: !!selectedCompanyId,
  });
  const recentActivity = activityList?.slice(0, 10) ?? [];

  useEffect(() => {
    setBreadcrumbs([
      { label: company?.name ?? t("startupBuilder.dashboard") },
      { label: t("startupBuilder.dashboard") },
    ]);
  }, [company?.name, setBreadcrumbs, t]);

  if (!selectedCompanyId) {
    return (
      <div className="mx-auto max-w-xl py-10 text-sm text-muted-foreground">
        {t("dashboard.selectCompanyToView")}
      </div>
    );
  }

  const hasProfile = !!profile;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{t("startupBuilder.dashboard")}</h1>
        <p className="mt-1 text-muted-foreground">
          {company?.name}
          {hasProfile && profile.targetMarket && ` · ${profile.targetMarket}`}
        </p>
      </div>

      {hasProfile && (
        <>
          {profile.visionSummary && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  {t("startupBuilder.vision")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {profile.visionSummary}
                </p>
                {profile.techStack && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    {t("startupBuilder.techStack")}: {profile.techStack}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {(profile.roadmap30Days?.length > 0 || profile.roadmap90Days?.length > 0) && (
            <div className="grid gap-4 md:grid-cols-2">
              {profile.roadmap30Days?.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">{t("startupBuilder.roadmap30")}</CardTitle>
                    <CardDescription>{t("startupBuilder.roadmap30Desc")}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1.5 text-sm">
                      {profile.roadmap30Days.slice(0, 8).map((item, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="text-muted-foreground">{i + 1}.</span>
                          <span>{item.title}</span>
                        </li>
                      ))}
                      {profile.roadmap30Days.length > 8 && (
                        <li className="text-muted-foreground">
                          +{profile.roadmap30Days.length - 8} {t("common.more")}
                        </li>
                      )}
                    </ul>
                  </CardContent>
                </Card>
              )}
              {profile.roadmap90Days?.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">{t("startupBuilder.roadmap90")}</CardTitle>
                    <CardDescription>{t("startupBuilder.roadmap90Desc")}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1.5 text-sm">
                      {profile.roadmap90Days.slice(0, 8).map((item, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="text-muted-foreground">{i + 1}.</span>
                          <span>{item.title}</span>
                        </li>
                      ))}
                      {profile.roadmap90Days.length > 8 && (
                        <li className="text-muted-foreground">
                          +{profile.roadmap90Days.length - 8} {t("common.more")}
                        </li>
                      )}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </>
      )}

      {!hasProfile && (
        <Card>
          <CardContent className="py-6">
            <p className="text-sm text-muted-foreground">{t("startupBuilder.noProfile")}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="h-4 w-4" />
              {t("startupBuilder.taskProgress")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dashboardSummary ? (
              <div className="space-y-2 text-sm">
                <p>
                  {t("dashboard.open")}: {dashboardSummary.tasks.open} · {t("dashboard.blocked")}:{" "}
                  {dashboardSummary.tasks.blocked}
                </p>
                <Link to="/issues" className="text-primary hover:underline">
                  {t("startupBuilder.viewAllTasks")}
                </Link>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ListTodo className="h-4 w-4" />
              {t("startupBuilder.recentTasks")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentIssues.length > 0 ? (
              <ul className="space-y-1.5 text-sm">
                {recentIssues.map((issue) => (
                  <li key={issue.id}>
                    <Link
                      to={`/issues/${issue.id}`}
                      className="text-primary hover:underline truncate block"
                    >
                      {issue.title}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">{t("dashboard.noTasksYet")}</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <History className="h-4 w-4" />
            {t("startupBuilder.agentActivity")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentActivity.length > 0 ? (
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              {recentActivity.slice(0, 8).map((event) => (
                <li key={event.id}>
                  {event.action} · {new Date(event.createdAt).toLocaleString()}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">{t("dashboard.recentActivity")}</p>
          )}
          <Link to="/activity" className="mt-2 inline-block text-sm text-primary hover:underline">
            {t("startupBuilder.viewAllActivity")}
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

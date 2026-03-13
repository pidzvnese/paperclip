import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "@/lib/router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useBreadcrumbs } from "../context/BreadcrumbContext";
import { startupBuilderApi } from "../api/startup-builder";
import { queryKeys } from "../lib/queryKeys";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Rocket, Loader2 } from "lucide-react";

export function StartupBuilderCreate() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setBreadcrumbs } = useBreadcrumbs();
  const [startupName, setStartupName] = useState("");
  const [startupDescription, setStartupDescription] = useState("");
  const [targetMarket, setTargetMarket] = useState("");
  const [techStack, setTechStack] = useState("");
  const [templateSlug, setTemplateSlug] = useState<string | null>(null);

  const { data: templates } = useQuery({
    queryKey: ["startup-builder", "templates"],
    queryFn: () => startupBuilderApi.listTemplates(),
  });

  const createMutation = useMutation({
    mutationFn: (data: Parameters<typeof startupBuilderApi.create>[0]) =>
      startupBuilderApi.create(data),
    onSuccess: (result) => {
      navigate(`/${result.issuePrefix}/startup-builder`, { replace: true });
    },
  });

  useEffect(() => {
    setBreadcrumbs([{ label: t("startupBuilder.title") }]);
  }, [setBreadcrumbs, t]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!startupName.trim()) return;
    createMutation.mutate({
      startupName: startupName.trim(),
      startupDescription: startupDescription.trim() || undefined,
      targetMarket: targetMarket.trim() || undefined,
      techStack: techStack.trim() || undefined,
      templateSlug: templateSlug ?? undefined,
    });
  }

  return (
    <div className="mx-auto max-w-xl space-y-6 py-6">
      <div>
        <h1 className="text-2xl font-semibold">{t("startupBuilder.title")}</h1>
        <p className="mt-1 text-muted-foreground">{t("startupBuilder.subtitle")}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rocket className="h-5 w-5" />
            {t("startupBuilder.step1Title")}
          </CardTitle>
          <CardDescription>{t("startupBuilder.step1Desc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="startupName">{t("startupBuilder.startupName")}</Label>
              <Input
                id="startupName"
                value={startupName}
                onChange={(e) => setStartupName(e.target.value)}
                placeholder={t("startupBuilder.startupNamePlaceholder")}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="startupDescription">{t("startupBuilder.startupDescription")}</Label>
              <Textarea
                id="startupDescription"
                value={startupDescription}
                onChange={(e) => setStartupDescription(e.target.value)}
                placeholder={t("startupBuilder.startupDescriptionPlaceholder")}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="targetMarket">{t("startupBuilder.targetMarket")}</Label>
              <Input
                id="targetMarket"
                value={targetMarket}
                onChange={(e) => setTargetMarket(e.target.value)}
                placeholder={t("startupBuilder.targetMarketPlaceholder")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="techStack">{t("startupBuilder.techStack")}</Label>
              <Input
                id="techStack"
                value={techStack}
                onChange={(e) => setTechStack(e.target.value)}
                placeholder={t("startupBuilder.techStackPlaceholder")}
              />
            </div>
            {templates && templates.length > 0 && (
              <div className="space-y-2">
                <Label>{t("startupBuilder.template")}</Label>
                <Select
                  value={templateSlug ?? ""}
                  onValueChange={(v) => setTemplateSlug(v || null)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("startupBuilder.templatePlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">{t("startupBuilder.templateNone")}</SelectItem>
                    {templates.map((tpl) => (
                      <SelectItem key={tpl.slug} value={tpl.slug}>
                        {tpl.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="pt-2">
              <Button type="submit" disabled={createMutation.isPending || !startupName.trim()}>
                {createMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Rocket className="h-4 w-4 mr-2" />
                )}
                {createMutation.isPending
                  ? t("startupBuilder.creating")
                  : t("startupBuilder.createWorkspace")}
              </Button>
              {createMutation.isError && (
                <p className="mt-2 text-sm text-destructive">
                  {createMutation.error instanceof Error
                    ? createMutation.error.message
                    : t("common.failedToLoad")}
                </p>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

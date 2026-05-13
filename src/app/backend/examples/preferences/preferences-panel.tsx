"use client";

import { useState } from "react";
import { toast } from "sonner";
import { GitBranch, Mail, MessageSquare } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

type Notifications = {
  email: boolean;
  push: boolean;
  weeklyDigest: boolean;
};

type Visibility = "public" | "members" | "private";

type Integration = {
  id: "github" | "slack" | "gmail";
  name: string;
  description: string;
  icon: React.ElementType;
  connected: boolean;
};

const INITIAL_INTEGRATIONS: Integration[] = [
  {
    id: "github",
    name: "GitHub",
    description: "Sync repositories and issues.",
    icon: GitBranch,
    connected: true,
  },
  {
    id: "slack",
    name: "Slack",
    description: "Send notifications to channels.",
    icon: MessageSquare,
    connected: false,
  },
  {
    id: "gmail",
    name: "Gmail",
    description: "Email summaries and digests.",
    icon: Mail,
    connected: false,
  },
];

export function PreferencesPanel() {
  const [notifications, setNotifications] = useState<Notifications>({
    email: true,
    push: false,
    weeklyDigest: true,
  });
  const [visibility, setVisibility] = useState<Visibility>("members");
  const [integrations, setIntegrations] = useState<Integration[]>(INITIAL_INTEGRATIONS);
  const [saving, setSaving] = useState(false);

  function toggleIntegration(id: Integration["id"]) {
    setIntegrations((prev) =>
      prev.map((i) => (i.id === id ? { ...i, connected: !i.connected } : i)),
    );
  }

  function onSave() {
    setSaving(true);
    setTimeout(() => {
      toast.success("Preferences saved (demo).");
      setSaving(false);
    }, 400);
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>How and when we contact you.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ToggleRow
            label="Email notifications"
            description="Get an email for important account activity."
            checked={notifications.email}
            onCheckedChange={(v) => setNotifications((n) => ({ ...n, email: v }))}
          />
          <Separator />
          <ToggleRow
            label="Push notifications"
            description="Browser push for new messages."
            checked={notifications.push}
            onCheckedChange={(v) => setNotifications((n) => ({ ...n, push: v }))}
          />
          <Separator />
          <ToggleRow
            label="Weekly digest"
            description="A summary of activity, every Monday."
            checked={notifications.weeklyDigest}
            onCheckedChange={(v) =>
              setNotifications((n) => ({ ...n, weeklyDigest: v }))
            }
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Privacy</CardTitle>
          <CardDescription>Who can see your profile.</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={visibility}
            onValueChange={(v) => setVisibility(v as Visibility)}
            className="gap-4"
          >
            <RadioRow
              value="public"
              title="Public"
              description="Anyone on the internet can see your profile."
            />
            <RadioRow
              value="members"
              title="Members only"
              description="Visible to signed-in users on this site."
            />
            <RadioRow
              value="private"
              title="Private"
              description="Only you and admins can see your profile."
            />
          </RadioGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Integrations</CardTitle>
          <CardDescription>Connect third-party services.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {integrations.map((i, idx) => (
            <div key={i.id}>
              {idx > 0 ? <Separator className="mb-3" /> : null}
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-md border bg-muted">
                    <i.icon className="size-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{i.name}</p>
                    <p className="text-xs text-muted-foreground">{i.description}</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant={i.connected ? "outline" : "default"}
                  onClick={() => toggleIntegration(i.id)}
                >
                  {i.connected ? "Disconnect" : "Connect"}
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={onSave} disabled={saving}>
          {saving ? "Saving..." : "Save preferences"}
        </Button>
      </div>
    </div>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onCheckedChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

function RadioRow({
  value,
  title,
  description,
}: {
  value: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <RadioGroupItem value={value} id={`vis-${value}`} className="mt-1" />
      <div className="grid gap-1">
        <Label htmlFor={`vis-${value}`} className="text-sm font-medium">
          {title}
        </Label>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

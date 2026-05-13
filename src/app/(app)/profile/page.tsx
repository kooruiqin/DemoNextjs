import { requireSession } from "@/lib/session";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ProfileForm } from "./profile-form";
import { PasswordForm } from "./password-form";

export default async function ProfilePage() {
  const session = await requireSession();
  const u = session.user;
  const role = (u as { role?: string }).role ?? "user";

  const initials =
    u.name
      .split(" ")
      .map((p) => p[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() ||
    u.email[0]?.toUpperCase() ||
    "?";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
        <p className="text-sm text-muted-foreground">
          Manage how others see you on this site.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Avatar</CardTitle>
            <CardDescription>Coming soon — uploads.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                {u.image ? <AvatarImage src={u.image} alt={u.name} /> : null}
                <AvatarFallback className="text-lg">{initials}</AvatarFallback>
              </Avatar>
              <div className="text-sm">
                <p className="flex items-center gap-2 font-medium">
                  {u.name}
                  {role === "admin" ? <Badge>Admin</Badge> : null}
                </p>
                <p className="text-muted-foreground">{u.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Account details</CardTitle>
            <CardDescription>
              Your display name. Email is shown read-only.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={u.email} disabled readOnly />
            </div>
            <ProfileForm defaultName={u.name} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Password</CardTitle>
          <CardDescription>
            Change your password. Other active sessions will be signed out.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PasswordForm />
        </CardContent>
      </Card>
    </div>
  );
}

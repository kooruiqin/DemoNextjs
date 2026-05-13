"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const accountSchema = z.object({
  email: z.string().email(),
  username: z
    .string()
    .min(3, "Min 3 characters")
    .regex(/^[a-z0-9_]+$/i, "Letters, numbers, underscore only"),
});

const profileSchema = z.object({
  fullName: z.string().min(1, "Required"),
  bio: z.string().max(280).optional().or(z.literal("")),
});

type AccountValues = z.infer<typeof accountSchema>;
type ProfileValues = z.infer<typeof profileSchema>;

const STEPS = [
  { id: 1, title: "Account", description: "Login details" },
  { id: 2, title: "Profile", description: "How others see you" },
  { id: 3, title: "Review", description: "Confirm and submit" },
] as const;

export function WizardForm() {
  const [step, setStep] = useState(1);
  const [account, setAccount] = useState<AccountValues>({ email: "", username: "" });
  const [profile, setProfile] = useState<ProfileValues>({ fullName: "", bio: "" });
  const [submitting, setSubmitting] = useState(false);

  const progress = (step / STEPS.length) * 100;

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Progress value={progress} />
        <ol className="flex items-center justify-between text-xs">
          {STEPS.map((s) => (
            <li
              key={s.id}
              className={
                s.id === step
                  ? "font-semibold text-foreground"
                  : s.id < step
                    ? "text-foreground"
                    : "text-muted-foreground"
              }
            >
              <span className="mr-1">
                {s.id < step ? <Check className="inline size-3" /> : s.id}.
              </span>
              {s.title}
            </li>
          ))}
        </ol>
      </div>

      {step === 1 ? (
        <AccountStep
          defaults={account}
          onNext={(v) => {
            setAccount(v);
            setStep(2);
          }}
        />
      ) : null}

      {step === 2 ? (
        <ProfileStep
          defaults={profile}
          onBack={() => setStep(1)}
          onNext={(v) => {
            setProfile(v);
            setStep(3);
          }}
        />
      ) : null}

      {step === 3 ? (
        <ReviewStep
          account={account}
          profile={profile}
          submitting={submitting}
          onBack={() => setStep(2)}
          onSubmit={() => {
            setSubmitting(true);
            setTimeout(() => {
              toast.success("Submitted (demo). Account would be created here.");
              setSubmitting(false);
            }, 600);
          }}
        />
      ) : null}
    </div>
  );
}

function AccountStep({
  defaults,
  onNext,
}: {
  defaults: AccountValues;
  onNext: (v: AccountValues) => void;
}) {
  const form = useForm<AccountValues>({
    resolver: zodResolver(accountSchema),
    defaultValues: defaults,
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onNext)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="you@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="yourname" {...field} />
              </FormControl>
              <FormDescription>3+ chars, letters/numbers/underscore.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end">
          <Button type="submit">
            Next
            <ChevronRight />
          </Button>
        </div>
      </form>
    </Form>
  );
}

function ProfileStep({
  defaults,
  onBack,
  onNext,
}: {
  defaults: ProfileValues;
  onBack: () => void;
  onNext: (v: ProfileValues) => void;
}) {
  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: defaults,
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onNext)} className="space-y-4">
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full name</FormLabel>
              <FormControl>
                <Input placeholder="Ada Lovelace" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio (optional)</FormLabel>
              <FormControl>
                <Textarea rows={3} placeholder="A few words about you" {...field} />
              </FormControl>
              <FormDescription>Up to 280 characters.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-between">
          <Button type="button" variant="ghost" onClick={onBack}>
            <ChevronLeft />
            Back
          </Button>
          <Button type="submit">
            Next
            <ChevronRight />
          </Button>
        </div>
      </form>
    </Form>
  );
}

function ReviewStep({
  account,
  profile,
  submitting,
  onBack,
  onSubmit,
}: {
  account: AccountValues;
  profile: ProfileValues;
  submitting: boolean;
  onBack: () => void;
  onSubmit: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="space-y-3 rounded-md border p-4 text-sm">
        <Row label="Email" value={account.email || "—"} />
        <Row label="Username" value={account.username || "—"} />
        <Row label="Full name" value={profile.fullName || "—"} />
        <Row label="Bio" value={profile.bio?.trim() ? profile.bio : "—"} />
      </div>
      <div className="flex justify-between">
        <Button type="button" variant="ghost" onClick={onBack}>
          <ChevronLeft />
          Back
        </Button>
        <Button type="button" onClick={onSubmit} disabled={submitting}>
          {submitting ? "Submitting..." : "Submit"}
        </Button>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="max-w-[60%] text-right">{value}</span>
    </div>
  );
}

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="max-w-2xl text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Next.js Starter</h1>
        <p className="mt-4 text-muted-foreground">
          Drizzle · Better-Auth · shadcn/ui · Tailwind 4 · TypeScript
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Button asChild>
            <Link href="/signup">Get started</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/login">Sign in</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}

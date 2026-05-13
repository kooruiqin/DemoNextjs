import Link from "next/link";
import type { Route } from "next";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MOCK_PRODUCT } from "@/lib/examples/mock-data";
import { DetailEditForm } from "./edit-form";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "outline"> = {
  active: "default",
  draft: "secondary",
  archived: "outline",
};

export default function DetailExamplePage() {
  const p = MOCK_PRODUCT;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href={"/backend/examples/filter-table" as Route}>
            <ArrowLeft />
            Back
          </Link>
        </Button>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">{p.name}</h1>
            <Badge variant={STATUS_VARIANT[p.status]}>{p.status}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {p.sku} · {p.category}
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-semibold tabular-nums">${p.price.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground">Created {p.createdAt}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Details</CardTitle>
            <CardDescription>Read-only metadata.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Row label="ID" value={p.id} mono />
            <Separator />
            <Row label="SKU" value={p.sku} mono />
            <Separator />
            <Row label="Category" value={p.category} />
            <Separator />
            <Row label="Stock" value={p.stock.toString()} />
            <Separator />
            <Row label="Status" value={p.status} />
            <Separator />
            <Row label="Created" value={p.createdAt} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Edit product</CardTitle>
            <CardDescription>
              Toggle Edit to modify. Save is mocked — no persistence.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DetailEditForm
              defaults={{
                name: p.name,
                description: p.description,
                price: p.price,
                stock: p.stock,
              }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className={mono ? "font-mono text-xs" : "font-medium"}>{value}</span>
    </div>
  );
}

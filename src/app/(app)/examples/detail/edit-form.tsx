"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Pencil, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const schema = z.object({
  name: z.string().trim().min(1, "Required").max(80),
  description: z.string().trim().min(1, "Required").max(500),
  price: z.number().min(0, "Must be ≥ 0"),
  stock: z.number().int().min(0, "Must be ≥ 0"),
});

type FormValues = z.infer<typeof schema>;

type Props = { defaults: FormValues };

export function DetailEditForm({ defaults }: Props) {
  const [editing, setEditing] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaults,
  });

  function onSubmit(values: FormValues) {
    // Mocked persistence — pretend the API succeeded after a tick.
    setTimeout(() => {
      toast.success(`Saved "${values.name}" (demo).`);
      form.reset(values);
      setEditing(false);
    }, 300);
  }

  function onCancel() {
    form.reset(defaults);
    setEditing(false);
  }

  const disabled = !editing;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input disabled={disabled} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea rows={4} disabled={disabled} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price (USD)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    disabled={disabled}
                    name={field.name}
                    ref={field.ref}
                    onBlur={field.onBlur}
                    value={Number.isFinite(field.value) ? field.value : ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === "" ? Number.NaN : e.target.valueAsNumber,
                      )
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="stock"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stock</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    disabled={disabled}
                    name={field.name}
                    ref={field.ref}
                    onBlur={field.onBlur}
                    value={Number.isFinite(field.value) ? field.value : ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === "" ? Number.NaN : e.target.valueAsNumber,
                      )
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          {editing ? (
            <>
              <Button type="button" variant="ghost" onClick={onCancel}>
                <X />
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Saving..." : "Save changes"}
              </Button>
            </>
          ) : (
            <Button type="button" onClick={() => setEditing(true)}>
              <Pencil />
              Edit
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}

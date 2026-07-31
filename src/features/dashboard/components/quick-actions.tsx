"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { uiZh } from "@/config/ui-zh";
import { createClient } from "@/lib/supabase/client";

const clientSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
});

const weddingSchema = z.object({
  name: z.string().min(1),
  wedding_date: z.string().min(1),
  venue: z.string().optional(),
});

const taskSchema = z.object({
  title: z.string().min(1),
  due_at: z.string().optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]),
});

const quoteSchema = z.object({
  description: z.string().min(1),
  amount: z.number().positive(),
  occurred_on: z.string().min(1),
});

type SheetKind = "client" | "wedding" | "task" | "quote" | null;

type ClientFormValues = z.infer<typeof clientSchema>;
type WeddingFormValues = z.infer<typeof weddingSchema>;
type TaskFormValues = z.infer<typeof taskSchema>;
type QuoteFormValues = z.infer<typeof quoteSchema>;

export function QuickActions() {
  const router = useRouter();
  const [open, setOpen] = useState<SheetKind>(null);
  const [pending, startTransition] = useTransition();

  const clientForm = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: { name: "", email: "", phone: "" },
  });
  const weddingForm = useForm<WeddingFormValues>({
    resolver: zodResolver(weddingSchema),
    defaultValues: { name: "", wedding_date: "", venue: "" },
  });
  const taskForm = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: { title: "", due_at: "", priority: "medium" },
  });
  const quoteForm = useForm<QuoteFormValues>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      description: "",
      amount: 0,
      occurred_on: new Date().toISOString().slice(0, 10),
    },
  });

  async function withUser() {
    const supabase = createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error || !user) {
      toast.error(uiZh.signIn);
      return null;
    }
    return { supabase, user };
  }

  function close() {
    setOpen(null);
    clientForm.reset();
    weddingForm.reset();
    taskForm.reset();
    quoteForm.reset();
  }

  return (
    <>
      <section className="space-y-3">
        <h2 className="text-sm text-white/80">{uiZh.quickActions}</h2>
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          {(
            [
              { kind: "client" as const, label: uiZh.newClientTitle },
              { kind: "wedding" as const, label: uiZh.addWedding },
              { kind: "task" as const, label: uiZh.newTaskTitle },
              { kind: "quote" as const, label: uiZh.addQuote },
            ] as const
          ).map((action) => (
            <Button
              key={action.kind}
              variant="outline"
              onClick={() => setOpen(action.kind)}
              className="h-auto justify-start border-white/[0.08] bg-white/[0.03] px-4 py-3 text-left text-white/90 hover:bg-white/[0.06]"
            >
              {action.label}
            </Button>
          ))}
        </div>
      </section>

      <Sheet open={open === "client"} onOpenChange={(v) => !v && close()}>
        <SheetContent className="border-white/10 bg-[#111113] text-white sm:max-w-md">
          <SheetHeader>
            <SheetTitle>{uiZh.newClientTitle}</SheetTitle>
          </SheetHeader>
          <form
            className="mt-6 space-y-4"
            onSubmit={clientForm.handleSubmit((values) => {
              startTransition(async () => {
                const ctx = await withUser();
                if (!ctx) return;
                const { error } = await ctx.supabase.from("clients").insert({
                  user_id: ctx.user.id,
                  name: values.name,
                  email: values.email || null,
                  phone: values.phone || null,
                });
                if (error) {
                  toast.error(error.message);
                  return;
                }
                toast.success(`${uiZh.newClientTitle} ✓`);
                close();
                router.refresh();
              });
            })}
          >
            <div className="space-y-2">
              <Label>{uiZh.name}</Label>
              <Input className="bg-white/5" {...clientForm.register("name")} />
            </div>
            <div className="space-y-2">
              <Label>{uiZh.email}</Label>
              <Input className="bg-white/5" {...clientForm.register("email")} />
            </div>
            <div className="space-y-2">
              <Label>{uiZh.phone}</Label>
              <Input className="bg-white/5" {...clientForm.register("phone")} />
            </div>
            <Button type="submit" disabled={pending} className="w-full">
              {uiZh.save}
            </Button>
          </form>
        </SheetContent>
      </Sheet>

      <Sheet open={open === "wedding"} onOpenChange={(v) => !v && close()}>
        <SheetContent className="border-white/10 bg-[#111113] text-white sm:max-w-md">
          <SheetHeader>
            <SheetTitle>{uiZh.addWedding}</SheetTitle>
          </SheetHeader>
          <form
            className="mt-6 space-y-4"
            onSubmit={weddingForm.handleSubmit((values) => {
              startTransition(async () => {
                const ctx = await withUser();
                if (!ctx) return;
                const { error } = await ctx.supabase.from("weddings").insert({
                  user_id: ctx.user.id,
                  name: values.name,
                  wedding_date: values.wedding_date,
                  venue: values.venue || null,
                  status: "inquiry",
                });
                if (error) {
                  toast.error(error.message);
                  return;
                }
                toast.success(`${uiZh.addWedding} ✓`);
                close();
                router.refresh();
              });
            })}
          >
            <div className="space-y-2">
              <Label>{uiZh.weddingName}</Label>
              <Input className="bg-white/5" {...weddingForm.register("name")} />
            </div>
            <div className="space-y-2">
              <Label>{uiZh.date}</Label>
              <Input
                type="date"
                className="bg-white/5"
                {...weddingForm.register("wedding_date")}
              />
            </div>
            <div className="space-y-2">
              <Label>{uiZh.venue}</Label>
              <Input className="bg-white/5" {...weddingForm.register("venue")} />
            </div>
            <Button type="submit" disabled={pending} className="w-full">
              {uiZh.save}
            </Button>
          </form>
        </SheetContent>
      </Sheet>

      <Sheet open={open === "task"} onOpenChange={(v) => !v && close()}>
        <SheetContent className="border-white/10 bg-[#111113] text-white sm:max-w-md">
          <SheetHeader>
            <SheetTitle>{uiZh.newTaskTitle}</SheetTitle>
          </SheetHeader>
          <form
            className="mt-6 space-y-4"
            onSubmit={taskForm.handleSubmit((values) => {
              startTransition(async () => {
                const ctx = await withUser();
                if (!ctx) return;
                const dueAt = values.due_at
                  ? new Date(values.due_at).toISOString()
                  : null;
                const { error } = await ctx.supabase.from("tasks").insert({
                  user_id: ctx.user.id,
                  owner_id: ctx.user.id,
                  title: values.title,
                  priority: values.priority,
                  due_at: dueAt,
                  status: "todo",
                });
                if (error) {
                  toast.error(error.message);
                  return;
                }
                toast.success(`${uiZh.newTaskTitle} ✓`);
                close();
                router.refresh();
              });
            })}
          >
            <div className="space-y-2">
              <Label>{uiZh.taskSingular}</Label>
              <Input className="bg-white/5" {...taskForm.register("title")} />
            </div>
            <div className="space-y-2">
              <Label>{uiZh.dueTime}</Label>
              <Input
                type="datetime-local"
                className="bg-white/5"
                {...taskForm.register("due_at")}
              />
            </div>
            <div className="space-y-2">
              <Label>{uiZh.priority}</Label>
              <select
                className="flex h-9 w-full rounded-md border border-white/10 bg-white/5 px-3 text-sm"
                {...taskForm.register("priority")}
              >
                <option value="low">{uiZh.priorityLow}</option>
                <option value="medium">{uiZh.priorityMedium}</option>
                <option value="high">{uiZh.priorityHigh}</option>
                <option value="urgent">{uiZh.priorityUrgent}</option>
              </select>
            </div>
            <Button type="submit" disabled={pending} className="w-full">
              {uiZh.save}
            </Button>
          </form>
        </SheetContent>
      </Sheet>

      <Sheet open={open === "quote"} onOpenChange={(v) => !v && close()}>
        <SheetContent className="border-white/10 bg-[#111113] text-white sm:max-w-md">
          <SheetHeader>
            <SheetTitle>{uiZh.addQuote}</SheetTitle>
          </SheetHeader>
          <form
            className="mt-6 space-y-4"
            onSubmit={quoteForm.handleSubmit((values) => {
              startTransition(async () => {
                const ctx = await withUser();
                if (!ctx) return;
                const { error } = await ctx.supabase
                  .from("financial_records")
                  .insert({
                    user_id: ctx.user.id,
                    record_type: "revenue",
                    amount: values.amount,
                    status: "outstanding",
                    occurred_on: values.occurred_on,
                    description: values.description,
                    currency: "HKD",
                  });
                if (error) {
                  toast.error(error.message);
                  return;
                }
                toast.success(`${uiZh.addQuote} ✓`);
                close();
                router.refresh();
              });
            })}
          >
            <div className="space-y-2">
              <Label>{uiZh.description}</Label>
              <Input
                className="bg-white/5"
                {...quoteForm.register("description")}
              />
            </div>
            <div className="space-y-2">
              <Label>{uiZh.amount}</Label>
              <Input
                type="number"
                step="0.01"
                className="bg-white/5"
                {...quoteForm.register("amount", { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2">
              <Label>{uiZh.date}</Label>
              <Input
                type="date"
                className="bg-white/5"
                {...quoteForm.register("occurred_on")}
              />
            </div>
            <Button type="submit" disabled={pending} className="w-full">
              {uiZh.save}
            </Button>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
}

"use client";

import { useId, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface NewsletterFormProps {
  variant?: "inline" | "centered";
  className?: string;
}

export function NewsletterForm({ variant = "inline", className }: NewsletterFormProps) {
  const [email, setEmail] = useState("");
  const inputId = useId();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) {
      toast.error("Enter a valid email address.");
      return;
    }
    toast.success("You're on the list.");
    setEmail("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "flex w-full flex-col gap-2",
        variant === "inline" && "max-w-sm sm:items-end",
        variant === "centered" && "max-w-md items-center",
        className
      )}
    >
      <label
        htmlFor={inputId}
        className={cn(
          "text-xs font-medium tracking-[0.12em] text-muted-foreground uppercase",
          variant === "inline" && "sm:self-end"
        )}
      >
        Newsletter
      </label>
      <div className="flex w-full gap-2">
        <Input
          id={inputId}
          type="email"
          required
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={cn(variant === "centered" && "bg-background")}
        />
        <Button type="submit" variant="default">
          Sign Up
        </Button>
      </div>
    </form>
  );
}

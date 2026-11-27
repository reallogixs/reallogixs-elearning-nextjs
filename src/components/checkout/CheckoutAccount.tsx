"use client";

import { useState, type ReactElement } from "react";
import { LogIn, UserPlus, UserRound } from "lucide-react";

import { cn } from "@/lib/cn";
import { refreshAccount } from "@/lib/account/accountStore";
import type { ContactInput } from "@/lib/validation/checkout";
import { LoginForm } from "@/components/auth/LoginForm";
import { SignupForm } from "@/components/auth/SignupForm";
import { Button } from "@/components/ui/Button";

type Choice = "guest" | "login" | "signup";

const CHOICES: { value: Choice; label: string; body: string; icon: ReactElement }[] = [
  {
    value: "guest",
    label: "Continue as guest",
    body: "No account. Track it with your order number.",
    icon: <UserRound />,
  },
  {
    value: "login",
    label: "Log in",
    body: "See this enrolment in your student portal.",
    icon: <LogIn />,
  },
  {
    value: "signup",
    label: "Create an account",
    body: "Keep your classes and certificates together.",
    icon: <UserPlus />,
  },
];

interface CheckoutAccountProps {
  /** Guest, or just signed up: the form starts with what they typed. */
  onGuest: (prefill: Partial<ContactInput>, signedUp: boolean) => void;
}

/** Before the details: guest, log in or sign up, all without leaving checkout. */
export function CheckoutAccount({ onGuest }: CheckoutAccountProps): ReactElement {
  const [choice, setChoice] = useState<Choice>("guest");
  return (
    <div className="flex flex-col gap-6">
      <fieldset className="grid gap-3 sm:grid-cols-3">
        <legend className="mb-3 text-small font-medium">How would you like to continue?</legend>
        {CHOICES.map((item) => {
          const checked = choice === item.value;
          return (
            <label
              key={item.value}
              className={cn(
                "flex min-h-24 cursor-pointer flex-col gap-1.5 rounded-md border p-4 transition-colors duration-fast has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-cyan-glow",
                checked ? "border-navy-900 bg-mist" : "border-line hover:border-navy-600/45",
              )}
            >
              <input
                type="radio"
                name="account"
                value={item.value}
                checked={checked}
                onChange={() => setChoice(item.value)}
                className="sr-only"
              />
              <span className="flex items-center gap-2 font-medium">
                <span aria-hidden="true" className="flex size-5 text-teal-600 [&>svg]:size-5">
                  {item.icon}
                </span>
                {item.label}
              </span>
              <span className="text-small text-ink-soft">{item.body}</span>
            </label>
          );
        })}
      </fieldset>

      {choice === "guest" ? (
        <div className="flex justify-end">
          <Button arrow onClick={() => onGuest({}, false)}>
            Continue as guest
          </Button>
        </div>
      ) : null}
      {choice === "login" ? (
        <LoginForm role="student" next={null} onSignedIn={refreshAccount} />
      ) : null}
      {choice === "signup" ? (
        <div className="flex flex-col gap-4">
          <p className="text-small text-ink-soft">
            We&apos;ll email you a link to choose your password. You can finish enrolling right
            away; this order joins your account once you set it.
          </p>
          <SignupForm onSent={(values) => onGuest(values, true)} />
        </div>
      ) : null}
    </div>
  );
}

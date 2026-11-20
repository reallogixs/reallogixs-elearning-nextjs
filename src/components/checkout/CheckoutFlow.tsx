"use client";

import { useEffect, useRef, useState, type ReactElement } from "react";
import Link from "next/link";

import type { StudentUser } from "@/types/domain";
import { ordersApi } from "@/lib/api";
import type { PromoPreview } from "@/lib/api/orders";
import { enrolmentState } from "@/lib/domain/orders";
import { findTeacherByCode, priceFor } from "@/lib/domain/pricing";
import { useCurrentUser, useDb, useHydrated } from "@/lib/store/hooks";
import { courseBySlug, enabledPaymentMethods, teachers } from "@/lib/store/selectors";
import type { ContactInput } from "@/lib/validation/checkout";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { NotFoundState } from "@/components/ui/NotFoundState";
import { Skeleton } from "@/components/ui/Skeleton";
import { OrderStatusPanel } from "@/components/orders/OrderStatusPanel";
import { ReceiptForm } from "@/components/orders/ReceiptForm";

import { DetailsStep } from "./DetailsStep";
import { PaymentStep } from "./PaymentStep";
import { PriceSummary } from "./PriceSummary";
import { PromoCodeField } from "./PromoCodeField";
import { StepIndicator } from "./StepIndicator";

const STEPS = ["Your details", "Payment", "Upload receipt"];

export function CheckoutFlow({ slug }: { slug: string }): ReactElement {
  const db = useDb();
  const hydrated = useHydrated();
  const user = useCurrentUser();
  const student = user?.role === "student" ? (user as StudentUser) : null;
  const course = courseBySlug(db, slug);
  const methods = enabledPaymentMethods(db);

  const [step, setStep] = useState(0);
  const [contact, setContact] = useState<ContactInput | null>(null);
  const [promo, setPromo] = useState<PromoPreview | null>(null);
  const [methodId, setMethodId] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Move focus to the new step's heading so keyboard and screen-reader users follow along.
  useEffect(() => {
    if (step > 0 || orderId) headingRef.current?.focus();
  }, [step, orderId]);

  if (!hydrated) return <Skeleton className="shell my-16 h-[32rem]" />;
  if (!course || course.status !== "published") {
    return (
      <NotFoundState
        title="Course not found"
        body="This course isn't available for enrolment."
        href="/courses"
        cta="See all courses"
      />
    );
  }

  if (orderId) {
    return (
      <div className="shell flex max-w-3xl flex-col gap-6 py-12 lg:py-16">
        <h1 ref={headingRef} tabIndex={-1} className="text-h2 outline-none">
          Receipt received. Save your order number.
        </h1>
        <p className="text-ink-soft">
          Use it with your phone number on the{" "}
          <Link href="/track" className="text-teal-700 underline">
            Track enrolment
          </Link>{" "}
          page.
          {student
            ? " It's also in your student portal."
            : " Create an account any time to keep all your courses in one place."}
        </p>
        <OrderStatusPanel orderId={orderId} />
        {!student ? (
          <div>
            <Button href="/signup" variant="secondary" size="sm">
              Create a student account (optional)
            </Button>
          </div>
        ) : null}
      </div>
    );
  }

  const state = enrolmentState(course, db.orders);
  const teacher = promo ? findTeacherByCode(teachers(db), promo.code) : null;
  const price = priceFor(course, teacher);

  return (
    <div className="shell grid gap-10 py-12 lg:grid-cols-[1fr_360px] lg:py-16">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-3">
          <p className="font-mono text-label text-ink-soft uppercase">Enrol</p>
          <h1 className="text-h2">{course.title}</h1>
          {!user ? (
            <p className="text-small text-ink-soft">
              Checking out as a guest.{" "}
              <Link
                href={`/login?next=/checkout/${course.slug}`}
                className="text-teal-700 underline"
              >
                Log in
              </Link>{" "}
              to save this to your account (optional).
            </p>
          ) : null}
        </div>

        {state !== "open" ? (
          <Alert tone="warning" title="Enrolment unavailable">
            This batch isn&apos;t taking enrolments right now.
          </Alert>
        ) : (
          <div className="flex flex-col gap-8 rounded-lg border border-line p-6 sm:p-10">
            <StepIndicator steps={STEPS} current={step} />
            <h2 ref={headingRef} tabIndex={-1} className="text-h3 outline-none" aria-live="polite">
              {STEPS[step]}
            </h2>

            {step === 0 ? (
              <DetailsStep
                initialValues={
                  contact ?? {
                    name: student?.name ?? "",
                    email: student?.email ?? "",
                    phone: student?.phone ?? "",
                  }
                }
                lockEmail={Boolean(student)}
                promoField={
                  <PromoCodeField
                    help={db.content.checkout.promoHelp}
                    applied={promo}
                    onApply={setPromo}
                  />
                }
                onNext={(values) => {
                  setContact(values);
                  setStep(1);
                }}
              />
            ) : null}

            {step === 1 ? (
              <PaymentStep
                methods={methods}
                amount={price.total}
                initialMethodId={methodId ?? ""}
                onBack={() => setStep(0)}
                onNext={(id) => {
                  setMethodId(id);
                  setStep(2);
                }}
              />
            ) : null}

            {step === 2 && contact && methodId ? (
              <ReceiptForm
                help={db.content.checkout.receiptHelp}
                submitLabel="Submit for verification"
                secondaryAction={
                  <Button variant="ghost" onClick={() => setStep(1)}>
                    Back
                  </Button>
                }
                onSubmit={async (receipt) => {
                  const result = await ordersApi.createOrder({
                    courseId: course.id,
                    studentId: student?.id ?? null,
                    contact,
                    promoCode: promo?.code ?? null,
                    paymentMethodId: methodId,
                    receipt,
                  });
                  if (result.ok) setOrderId(result.data.id);
                  return result;
                }}
              />
            ) : null}
          </div>
        )}
      </div>
      <aside className="lg:sticky lg:top-[calc(var(--rl-header-h)+1.5rem)] lg:self-start">
        <PriceSummary course={course} price={price} promoCode={promo?.code ?? null} />
      </aside>
    </div>
  );
}

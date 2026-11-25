"use client";

import { useEffect, useRef, useState, type ReactElement } from "react";
import Link from "next/link";

import type { CatalogueCourse } from "@/types/catalogue";
import type { PaymentMethod } from "@/types/domain";
import type { OrderResult, PromoPreview } from "@/types/portal";
import { useAccountLoaded } from "@/lib/account/accountStore";
import { courseEnrolment } from "@/lib/domain/catalogue";
import { priceFor } from "@/lib/domain/pricing";
import { useCurrentUser } from "@/lib/account/useCurrentUser";
import type { ContactInput } from "@/lib/validation/checkout";
import { PortalDataProvider } from "@/components/data/PortalData";
import { useContent } from "@/components/data/SiteData";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { OrderStatusPanel } from "@/components/orders/OrderStatusPanel";
import { ReceiptForm } from "@/components/orders/ReceiptForm";
import { placeOrder } from "@/server/actions/checkout";

import { DetailsStep } from "./DetailsStep";
import { PaymentStep } from "./PaymentStep";
import { MobileOrderSummary } from "./MobileOrderSummary";
import { PriceSummary } from "./PriceSummary";
import { PromoCodeField } from "./PromoCodeField";
import { StepIndicator } from "./StepIndicator";

const STEPS = ["Your details", "Payment", "Upload receipt"];

interface CheckoutFlowProps {
  course: CatalogueCourse;
  methods: PaymentMethod[];
}

export function CheckoutFlow({ course, methods }: CheckoutFlowProps): ReactElement {
  const { checkout } = useContent();
  const accountLoaded = useAccountLoaded();
  const user = useCurrentUser();
  const student = user?.role === "student" ? user : null;

  const [step, setStep] = useState(0);
  const [contact, setContact] = useState<ContactInput | null>(null);
  const [promo, setPromo] = useState<PromoPreview | null>(null);
  const [methodId, setMethodId] = useState<string | null>(null);
  const [placed, setPlaced] = useState<OrderResult | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Move focus to the new step's heading so keyboard and screen-reader users follow along.
  useEffect(() => {
    if (step > 0 || placed) headingRef.current?.focus();
  }, [step, placed]);

  if (!accountLoaded) return <Skeleton className="shell my-16 h-[32rem]" />;

  if (placed) {
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
        <PortalDataProvider data={placed.data}>
          <OrderStatusPanel orderId={placed.number} />
        </PortalDataProvider>
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

  const open = courseEnrolment(course) === "open" && methods.length > 0;
  const price = priceFor(course, promo?.discountPct ?? 0);

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

        <MobileOrderSummary course={course} price={price} promoCode={promo?.code ?? null} />

        {!open ? (
          <Alert tone="warning" title="Enrolment unavailable">
            This class isn&apos;t taking enrolments right now.
          </Alert>
        ) : (
          <div className="flex flex-col gap-8 rounded-lg border border-line p-5 sm:p-8 lg:p-10">
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
                  <PromoCodeField help={checkout.promoHelp} applied={promo} onApply={setPromo} />
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
                help={checkout.receiptHelp}
                submitLabel="Submit for verification"
                secondaryAction={
                  <Button variant="ghost" onClick={() => setStep(1)}>
                    Back
                  </Button>
                }
                onSubmit={async (receipt) => {
                  const result = await placeOrder({
                    ...receipt,
                    contact,
                    courseId: course.id,
                    paymentMethodId: methodId,
                    promoCode: promo?.code ?? "",
                    expectedTotal: price.total,
                  });
                  if (result.ok) setPlaced(result.data);
                  return result;
                }}
              />
            ) : null}
          </div>
        )}
      </div>
      <aside className="hidden lg:sticky lg:top-[calc(var(--rl-header-h)+1.5rem)] lg:block lg:self-start">
        <PriceSummary course={course} price={price} promoCode={promo?.code ?? null} />
      </aside>
    </div>
  );
}

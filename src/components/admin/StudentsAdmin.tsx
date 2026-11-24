"use client";

import { useState, type ReactElement } from "react";

import { formatPKR, normalisePhone } from "@/lib/domain/format";
import { useDb } from "@/lib/store/hooks";
import { students } from "@/lib/store/selectors";
import { PageHeader } from "@/components/portal/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { DataTable } from "@/components/ui/DataTable";
import { Input } from "@/components/ui/Input";

interface StudentRow {
  key: string;
  name: string;
  email: string;
  phone: string;
  registered: boolean;
  enrolments: number;
  paid: number;
}

/** Registered students plus guests, grouped by email so repeat guests appear once. */
export function StudentsAdmin(): ReactElement {
  const db = useDb();
  const [query, setQuery] = useState("");
  const rows = new Map<string, StudentRow>();

  for (const student of students(db)) {
    rows.set(student.email, {
      key: student.id,
      name: student.name,
      email: student.email,
      phone: student.phone,
      registered: true,
      enrolments: 0,
      paid: 0,
    });
  }
  for (const order of db.orders) {
    const linked = order.studentId
      ? db.users.find((user) => user.id === order.studentId)
      : undefined;
    const email = linked?.email ?? order.contact.email;
    const row = rows.get(email) ?? {
      key: email,
      name: order.contact.name,
      email,
      phone: order.contact.phone,
      registered: false,
      enrolments: 0,
      paid: 0,
    };
    if (order.status === "confirmed") {
      row.enrolments += 1;
      row.paid += order.price.total;
    }
    rows.set(email, row);
  }

  const needle = query.trim().toLowerCase();
  const list = [...rows.values()].filter(
    (row) =>
      !needle ||
      `${row.name} ${row.email}`.toLowerCase().includes(needle) ||
      normalisePhone(row.phone).includes(normalisePhone(needle)),
  );

  return (
    <>
      <PageHeader title="Students" description="Everyone who has enrolled or signed up." />
      <Input
        type="search"
        aria-label="Search students"
        placeholder="Search name, email or phone"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        className="md:w-80"
      />
      <DataTable
        caption="Students"
        rows={list}
        rowKey={(row) => row.key}
        columns={[
          {
            key: "name",
            header: "Name",
            cell: (row) => <span className="font-medium">{row.name}</span>,
          },
          { key: "email", header: "Email", hideBelow: "xl", cell: (row) => row.email },
          { key: "phone", header: "Phone", hideBelow: "xl", cell: (row) => row.phone },
          {
            key: "account",
            header: "Account",
            cell: (row) => (
              <Badge tone={row.registered ? "info" : "neutral"}>
                {row.registered ? "Registered" : "Guest"}
              </Badge>
            ),
          },
          { key: "enrolments", header: "Confirmed", cell: (row) => row.enrolments },
          {
            key: "paid",
            header: "Paid",
            hideBelow: "xl",
            className: "text-right",
            cell: (row) => formatPKR(row.paid),
          },
        ]}
      />
    </>
  );
}

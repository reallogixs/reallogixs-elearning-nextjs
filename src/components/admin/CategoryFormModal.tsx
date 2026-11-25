"use client";

import type { ReactElement } from "react";
import { Form, Formik } from "formik";

import type { Category } from "@/types/domain";
import { descendantIds } from "@/lib/domain/categories";
import { slugify } from "@/lib/domain/format";
import { useAction } from "@/lib/useAction";
import { categorySchema, type CategoryFormValues } from "@/lib/validation/admin";
import { SelectField } from "@/components/form/SelectField";
import { SubmitButton } from "@/components/form/SubmitButton";
import { TextField } from "@/components/form/TextField";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { saveCategory } from "@/server/actions/catalogue";

import { categoryOptions } from "./categoryOptions";

export interface CategoryDraft {
  category?: Category;
  parentId: string | null;
}

export function CategoryFormModal({
  categories,
  draft,
  onClose,
}: {
  categories: Category[];
  draft: CategoryDraft | null;
  onClose: () => void;
}): ReactElement {
  return (
    <Modal
      open={Boolean(draft)}
      onClose={onClose}
      title={draft?.category ? "Edit category" : "New category"}
    >
      {draft ? (
        <CategoryForm
          key={draft.category?.id ?? `new-${draft.parentId}`}
          categories={categories}
          draft={draft}
          onDone={onClose}
        />
      ) : null}
    </Modal>
  );
}

function CategoryForm({
  categories,
  draft,
  onDone,
}: {
  categories: Category[];
  draft: CategoryDraft;
  onDone: () => void;
}): ReactElement {
  const { run } = useAction();
  const { category } = draft;
  const exclude = category ? descendantIds(categories, category.id) : undefined;
  const initialValues: CategoryFormValues = {
    name: category?.name ?? "",
    slug: category?.slug ?? "",
    parentId: category ? (category.parentId ?? "") : (draft.parentId ?? ""),
    description: category?.description ?? "",
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={categorySchema}
      onSubmit={async (values) => {
        const result = await run(
          "save",
          () => saveCategory({ ...categorySchema.cast(values), id: category?.id ?? "" }),
          "Category saved.",
        );
        if (result.ok) onDone();
      }}
    >
      {({ values, handleBlur, setFieldValue }) => (
        <Form noValidate className="flex flex-col gap-5">
          <TextField
            name="name"
            label="Name"
            onBlur={(event) => {
              handleBlur(event);
              if (!values.slug) void setFieldValue("slug", slugify(event.target.value));
            }}
          />
          <TextField name="slug" label="Slug" className="font-mono" />
          <SelectField
            name="parentId"
            label="Parent category"
            hint="Leave as top level, or nest it under any category."
            placeholder="— Top level —"
            options={categoryOptions(categories, exclude)}
          />
          <TextField name="description" label="Description" optional />
          <div className="flex justify-end gap-3">
            <Button variant="ghost" size="sm" onClick={onDone}>
              Cancel
            </Button>
            <SubmitButton size="sm">Save category</SubmitButton>
          </div>
        </Form>
      )}
    </Formik>
  );
}

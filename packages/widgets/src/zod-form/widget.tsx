import { useMemo, useState, type FormEvent } from "react";
import { z } from "zod";
import { defineWidget } from "../contract";
import { Frame } from "../_shared/Frame";

/** Fields are plain JSON (so an agent can write them in a board); we turn them into a Zod schema at runtime. */
const Field = z.object({
  name: z.string(), label: z.string(),
  kind: z.enum(["text", "email", "number", "select"]),
  required: z.boolean().default(false),
  min: z.number().optional(), max: z.number().optional(),
  choices: z.array(z.string()).optional(),
});
type Field = z.infer<typeof Field>;

export function schemaFrom(fields: Field[]) {
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const f of fields) {
    let s: z.ZodTypeAny;
    if (f.kind === "number") {
      let n = z.coerce.number({ invalid_type_error: "Must be a number" });
      if (f.min !== undefined) n = n.min(f.min); if (f.max !== undefined) n = n.max(f.max);
      s = n;
    } else if (f.kind === "select") s = z.enum((f.choices?.length ? f.choices : [""]) as [string, ...string[]]);
    else {
      let t = f.kind === "email" ? z.string().email("Enter a valid email") : z.string();
      if (f.required) t = t.min(1, "Required");
      if (f.max !== undefined) t = t.max(f.max);
      s = t;
    }
    shape[f.name] = f.required ? s : s.optional().or(z.literal(""));
  }
  return z.object(shape);
}

const input = "w-full rounded border border-bk-line bg-bk-bg px-2 py-1 text-sm text-bk-fg outline-none focus-visible:ring-2 focus-visible:ring-bk-accent";

function Form({ fields, submitLabel }: { fields: Field[]; submitLabel: string }) {
  const schema = useMemo(() => schemaFrom(fields), [fields]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const r = schema.safeParse(Object.fromEntries(new FormData(e.currentTarget)));
    if (r.success) { setErrors({}); setDone(true); return; }
    setDone(false);
    setErrors(Object.fromEntries(r.error.issues.map((i) => [String(i.path[0]), i.message])));
  };
  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-2">
      {fields.map((f) => (
        <label key={f.name} className="flex flex-col gap-0.5 text-xs text-bk-muted">
          {f.label}{f.required && " *"}
          {f.kind === "select"
            ? <select name={f.name} className={input} aria-invalid={!!errors[f.name]}>{f.choices?.map((c) => <option key={c}>{c}</option>)}</select>
            : <input name={f.name} type={f.kind} className={input} aria-invalid={!!errors[f.name]} />}
          {errors[f.name] && <span className="text-bk-danger">{errors[f.name]}</span>}
        </label>
      ))}
      <button className="self-start rounded bg-bk-accent px-3 py-1 text-sm font-medium text-bk-on-accent focus-visible:ring-2 focus-visible:ring-bk-fg">{submitLabel}</button>
      {done && <p role="status" className="text-xs text-bk-ok">Saved ✓</p>}
    </form>
  );
}

export const ZodForm = defineWidget({
  type: "zod-form", family: "input", title: "Form",
  options: z.object({ label: z.string(), submitLabel: z.string().default("Save") }),
  data: z.object({ fields: z.array(Field) }),
  size: { min: [2, 3], default: [3, 4], max: [6, 10] },
  render: ({ options, data, state }) => (
    <Frame title={options.label} state={state === "ready" && !data?.fields.length ? "empty" : state} empty="No fields defined">
      {data && <Form fields={data.fields} submitLabel={options.submitLabel ?? "Save"} />}
    </Frame>
  ),
});

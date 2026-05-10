import { Inbox } from "lucide-react";
import { ReactNode } from "react";

export default function EmptyState({
  title = "Nada por aqui ainda",
  description,
  icon,
}: {
  title?: string;
  description?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-card/40 p-10 text-center animate-fade-in-up">
      <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-muted text-muted-foreground">
        {icon ?? <Inbox className="h-5 w-5" />}
      </div>
      <div className="text-sm font-medium">{title}</div>
      {description && <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">{description}</p>}
    </div>
  );
}

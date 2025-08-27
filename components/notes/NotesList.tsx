import { formatDistanceToNow } from "date-fns";
import type { Role } from "@prisma/client";

interface NoteEntry {
  id: string;
  body: string;
  createdAt: Date;
  user: {
    displayName: string;
    username: string;
    role: Role;
  };
}

export function NotesList({ notes }: { notes: NoteEntry[] }) {
  if (notes.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No notes yet.</p>
    );
  }

  return (
    <div className="space-y-3">
      {notes.map((note) => (
        <div key={note.id} className="rounded-md border p-3 text-sm">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="font-medium">{note.user.displayName}</span>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })}
            </span>
          </div>
          <p className="text-sm whitespace-pre-wrap">{note.body}</p>
        </div>
      ))}
    </div>
  );
}

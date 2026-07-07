import { useEffect, useId, useRef, useState } from "react";

import { UserFacingError } from "@/lib/dataRoom";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface NameDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  label: string;
  submitLabel: string;
  initialValue?: string;
  // Persists the name; a thrown UserFacingError shows as an inline error.
  onSubmit: (name: string) => Promise<void>;
}

function getErrorMessage(err: unknown): string {
  if (err instanceof UserFacingError) return err.message;

  return "Something went wrong. Please try again.";
}

export default function NameDialog({
  open,
  onOpenChange,
  title,
  description,
  label,
  submitLabel,
  initialValue = "",
  onSubmit,
}: NameDialogProps) {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();

  const inputInvalid = error !== null ? true : undefined;

  useEffect(() => {
    if (open) {
      setValue(initialValue);
      setError(null);
      setBusy(false);
    }
  }, [open, initialValue]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
    setError(null);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const name = value.trim();

    if (!name) {
      setError("Name cannot be empty.");
      inputRef.current?.focus();
      return;
    }

    setBusy(true);

    try {
      await onSubmit(name);
      onOpenChange(false);
    } catch (err) {
      setError(getErrorMessage(err));
      inputRef.current?.focus();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={inputId}>{label}</Label>
            <Input
              id={inputId}
              ref={inputRef}
              value={value}
              onChange={handleChange}
              autoFocus
              autoComplete="off"
              aria-invalid={inputInvalid}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy}>
              {submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

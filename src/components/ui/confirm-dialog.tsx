"use client";

import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  pending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  pending = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onCancel} label={title} className="sm:max-w-md">
      <div className="p-6">
        <h2 className="text-lg">{title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-muted">{description}</p>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel} disabled={pending}>
            Cancelar
          </Button>
          <Button onClick={onConfirm} disabled={pending}>
            {pending ? "Eliminando…" : confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

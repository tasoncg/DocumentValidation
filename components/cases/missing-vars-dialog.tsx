"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";

interface Props {
  open: boolean;
  missing: string[];
  onCancel: () => void;
  onContinue: () => void;
}

export function MissingVarsDialog({ open, missing, onCancel, onContinue }: Props) {
  return (
    <AlertDialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Còn variable trống</AlertDialogTitle>
          <AlertDialogDescription>
            Các variable sau chưa có giá trị. Tiếp tục có thể in ra văn bản thiếu thông tin:
          </AlertDialogDescription>
        </AlertDialogHeader>
        <ul className="list-disc space-y-1 pl-6 text-sm">
          {missing.map((n) => (
            <li key={n}>
              <code>{n}</code>
            </li>
          ))}
        </ul>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Huỷ</AlertDialogCancel>
          <AlertDialogAction
            onClick={onContinue}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Tiếp tục
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

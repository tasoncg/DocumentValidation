"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
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
import { useToast } from "@/components/ui/use-toast";
import { deleteTemplateAction } from "@/app/(app)/templates/actions";

interface Props {
  template: { id: string; name: string; _count: { cases: number } } | null;
  onClose: () => void;
}

export function DeleteTemplateDialog({ template, onClose }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, start] = useTransition();

  const open = template !== null;

  function onConfirm() {
    if (!template) return;
    start(async () => {
      const res = await deleteTemplateAction(template.id);
      if (res && "error" in res && res.error) {
        toast({ title: "Không thể xoá", description: res.error, variant: "destructive" });
        return;
      }
      toast({ title: "Đã xoá văn bản", description: template.name });
      onClose();
      router.refresh();
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={(o) => !o && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xoá văn bản mẫu?</AlertDialogTitle>
          <AlertDialogDescription>
            Văn bản <strong>{template?.name}</strong> sẽ bị xoá vĩnh viễn.
            {template && template._count.cases > 0 && (
              <>
                {" "}Sẽ xoá <strong>{template._count.cases}</strong> biên bản đã tạo từ văn bản này.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Huỷ</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={pending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {pending ? "Đang xoá..." : "Xoá"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export default function DeleteConfirmDialog({ open, onOpenChange, onConfirm }: DeleteConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="brutalist-border brutalist-shadow-pink bg-brutalist-charcoal">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-display text-2xl text-brutalist-pink">
            HAPUS CATATAN?
          </AlertDialogTitle>
          <AlertDialogDescription className="font-body text-brutalist-cream/70 text-base">
            Tindakan ini tidak dapat dibatalkan. Catatan akan dihapus secara permanen.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-3">
          <AlertDialogCancel className="brutalist-border bg-brutalist-charcoal text-brutalist-cream font-body hover:bg-brutalist-charcoal/80">
            BATAL
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="brutalist-border brutalist-shadow-pink bg-brutalist-pink text-brutalist-charcoal font-body hover:bg-brutalist-pink/90"
          >
            HAPUS
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

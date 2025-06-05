import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Интерфейс пропсов для диалога подтверждения удаления
interface DeleteConfirmationDialogProps {
  open: boolean; // Открыт ли диалог
  onOpenChange: (open: boolean) => void; // Функция для открытия/закрытия диалога
  onConfirm: () => void; // Функция, вызываемая при подтверждении удаления
  title: string; // Заголовок диалога
  description: string; // Описание (уточнение)
  cancelButtonText?: string; // Текст кнопки отмены
  confirmButtonText?: string; // Текст кнопки подтверждения
}

// Компонент диалога подтверждения удаления
export function DeleteConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  cancelButtonText = "Бас тарту",
  confirmButtonText = "Жою",
}: DeleteConfirmationDialogProps) {
  return (
    // Основной компонент диалога
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          {/* Заголовок и описание */}
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          {/* Кнопка отмены */}
          <AlertDialogCancel>{cancelButtonText}</AlertDialogCancel>
          {/* Кнопка подтверждения удаления */}
          <AlertDialogAction onClick={onConfirm}>{confirmButtonText}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

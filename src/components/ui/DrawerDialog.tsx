import { Drawer as VaulDrawer } from 'vaul';
import { cn } from '@/lib/utils';

interface DrawerDialogProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    trigger?: React.ReactNode;
    title?: string;
    description?: string;
    children: React.ReactNode;
    className?: string;
}

export function DrawerDialog({
    open,
    onOpenChange,
    trigger,
    title,
    description,
    children,
    className
}: DrawerDialogProps) {
    return (
        <VaulDrawer.Root open={open} onOpenChange={onOpenChange}>
            {trigger && <VaulDrawer.Trigger asChild>{trigger}</VaulDrawer.Trigger>}
            <VaulDrawer.Portal>
                <VaulDrawer.Overlay className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm" />
                <VaulDrawer.Content className={cn("bg-white flex flex-col rounded-t-[20px] h-[90vh] mt-24 fixed bottom-0 left-0 right-0 z-50 focus:outline-none", className)}>
                    <div className="p-4 bg-white rounded-t-[20px] flex-1 overflow-y-auto">
                        <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-slate-200 mb-6" />
                        <div className="max-w-md mx-auto pb-10">
                            {title && (
                                <VaulDrawer.Title className="font-bold mb-2 text-2xl text-slate-900">
                                    {title}
                                </VaulDrawer.Title>
                            )}
                            {description && (
                                <VaulDrawer.Description className="text-slate-500 mb-6 text-sm">
                                    {description}
                                </VaulDrawer.Description>
                            )}
                            {children}
                        </div>
                    </div>
                </VaulDrawer.Content>
            </VaulDrawer.Portal>
        </VaulDrawer.Root>
    );
}

import { Drawer as VaulDrawer } from 'vaul';

interface DrawerProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    children: React.ReactNode;
    trigger?: React.ReactNode;
    title?: string;
    description?: string;
}

export function Drawer({
    open,
    onOpenChange,
    children,
    trigger,
    title,
    description
}: DrawerProps) {
    return (
        <VaulDrawer.Root open={open} onOpenChange={onOpenChange}>
            {trigger && <VaulDrawer.Trigger asChild>{trigger}</VaulDrawer.Trigger>}
            <VaulDrawer.Portal>
                <VaulDrawer.Overlay className="fixed inset-0 bg-black/40 z-50" />
                <VaulDrawer.Content className="bg-white flex flex-col rounded-t-[10px] h-[90%] mt-24 fixed bottom-0 left-0 right-0 z-50 focus:outline-none">
                    <div className="p-4 bg-white rounded-t-[10px] flex-1">
                        <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-gray-300 mb-8" />
                        <div className="max-w-md mx-auto">
                            {title && (
                                <VaulDrawer.Title className="font-medium mb-4 text-xl">
                                    {title}
                                </VaulDrawer.Title>
                            )}
                            {description && (
                                <VaulDrawer.Description className="text-zinc-500 mb-4">
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

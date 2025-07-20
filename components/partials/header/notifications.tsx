
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Link } from '@/i18n/routing';
import { Icon } from "@/components/ui/icon";

const Notifications = () => {
    // For now, we'll use an empty array - in the future this could come from API/database
    const notifications: any[] = [];
    const notificationCount = notifications.length;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button type="button" className="relative  hidden focus:ring-none focus:outline-hidden md:h-8 md:w-8 md:bg-secondary   text-secondary-foreground    rounded-full  md:flex flex-col items-center justify-center cursor-pointer">
                    <Icon icon="heroicons-outline:bell" className="animate-tada h-5 w-5" />
                    {notificationCount > 0 && (
                        <Badge className=" w-4 h-4 p-0 text-[8px] rounded-full  font-semibold  items-center justify-center absolute left-[calc(100%-12px)] bottom-[calc(100%-10px)]" color="destructive">
                            {notificationCount > 99 ? '99+' : notificationCount}
                        </Badge>
                    )}
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                className=" z-999 mx-4 lg:w-[320px] p-0">
                <DropdownMenuLabel>
                    <div className="flex justify-between px-4 py-3 border-b border-default-100 ">
                        <div className="text-sm text-default-800  font-medium ">
                            Notifications
                        </div>
                        <div className="text-default-800  text-xs md:text-right">
                            <Link href="/eduprima/main/notifications" className="underline">
                                View all
                            </Link>
                        </div>
                    </div>
                </DropdownMenuLabel>
                <div className="h-[300px] xl:h-[350px]">
                    <ScrollArea className="h-full">
                        {notificationCount === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full py-8">
                                <Icon icon="heroicons-outline:bell" className="h-12 w-12 text-default-300 mb-4" />
                                <div className="text-sm text-default-500 text-center">
                                    No notifications
                                </div>
                                <div className="text-xs text-default-400 text-center mt-1">
                                    You&apos;re all caught up
                                </div>
                            </div>
                        ) : (
                            notifications.map((item: any, index: number) => (
                                <DropdownMenuItem key={`notification-${index}`} className="flex gap-9 py-2 px-4 cursor-pointer group">
                                    {/* Notification content would go here when we have real data */}
                                </DropdownMenuItem>
                            ))
                        )}
                    </ScrollArea>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default Notifications;

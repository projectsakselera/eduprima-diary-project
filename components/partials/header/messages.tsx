
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Link } from '@/i18n/routing';
import { Icon } from "@/components/ui/icon";

const Messages = () => {
    // For now, we'll use an empty array - in the future this could come from API/database
    const messages: any[] = [];
    const messageCount = messages.length;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button type="button" className="relative focus:ring-none focus:outline-hidden md:h-8 md:w-8 md:bg-secondary  text-secondary-foreground    rounded-full  md:flex hidden flex-col items-center justify-center cursor-pointer">
                    <Icon icon="heroicons-outline:mail" className="h-5 w-5" />
                    {messageCount > 0 && (
                        <Badge className=" w-4 h-4 p-0 text-[8px] rounded-full  font-semibold  items-center justify-center absolute left-[calc(100%-12px)] bottom-[calc(100%-10px)] " color="destructive">
                            {messageCount > 99 ? '99+' : messageCount}
                        </Badge>
                    )}
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className=" z-999 mx-4 lg:w-[320px] p-0" >
                <DropdownMenuLabel>
                    <div className="flex justify-between px-4 py-3 border-b border-default-100 ">
                        <div className="text-sm text-default-800  font-medium ">
                            Messages
                        </div>
                        <div className="text-default-800  text-xs md:text-right">
                            <Link href="/eduprima/main/messages" className="underline">
                                View all
                            </Link>
                        </div>
                    </div>
                </DropdownMenuLabel>
                <div className="h-[300px] xl:h-[350px]">
                    <ScrollArea className="h-full">
                        {messageCount === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full py-8">
                                <Icon icon="heroicons-outline:mail" className="h-12 w-12 text-default-300 mb-4" />
                                <div className="text-sm text-default-500 text-center">
                                    No messages
                                </div>
                                <div className="text-xs text-default-400 text-center mt-1">
                                    You&apos;re all caught up
                                </div>
                            </div>
                        ) : (
                            messages.map((item: any, index: number) => (
                                <DropdownMenuItem key={`message-${index}`} className="flex  items-start gap-3 py-2 px-4 cursor-pointer group ">
                                    {/* Message content would go here when we have real data */}
                                </DropdownMenuItem>
                            ))
                        )}
                    </ScrollArea>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default Messages;

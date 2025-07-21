
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Icon } from "@/components/ui/icon"
import { auth } from "@/lib/auth";
import Image from "next/image";
import { Link } from '@/i18n/routing';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import LogoutButton from "./logout-button";

const ProfileInfo = async () => {
  const session = await auth();
  
  // Debug log - bisa dihapus nanti
  console.log('Profile Session:', {
    hasSession: !!session,
    userImage: session?.user?.image,
    userName: session?.user?.name,
    userEmail: session?.user?.email
  });

  const userMenuItems = [
    {
      name: "Profile",
      icon: "heroicons:user",
      href: "/eduprima/main/profile"
    },
    {
      name: "Account Settings", 
      icon: "heroicons:cog-6-tooth",
      href: "/eduprima/main/settings"
    },
    {
      name: "Change Password",
      icon: "heroicons:lock-closed", 
      href: "/eduprima/main/change-password"
    },
    {
      name: "Break Time",
      icon: "heroicons:clock", 
      href: "/eduprima/break-time"
    }
  ];

  // Fallback data jika session tidak ada
  const displayName = session?.user?.name || 'User';
  const displayEmail = session?.user?.email || 'user@eduprima.com';
  const displayImage = session?.user?.image;
  const fallbackInitial = displayName.charAt(0).toUpperCase();

  return (
    <div className="md:block hidden">
      <DropdownMenu>
        <DropdownMenuTrigger asChild className=" cursor-pointer">
          <div className=" flex items-center gap-3  text-default-800 ">
            <Avatar className="h-9 w-9">
              <AvatarImage 
                src={displayImage || undefined} 
                alt={displayName}
                className="rounded-full object-cover"
              />
              <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                {fallbackInitial}
              </AvatarFallback>
            </Avatar>
            <div className="text-sm font-medium  capitalize lg:block hidden  ">
              {displayName}
            </div>
            <span className="text-base  me-2.5 lg:inline-block hidden">
              <Icon icon="heroicons-outline:chevron-down"></Icon>
            </span>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 p-0" align="end">
          <DropdownMenuLabel className="flex gap-2 items-center mb-1 p-3">
            <Avatar className="h-9 w-9">
              <AvatarImage 
                src={displayImage || undefined}
                alt={displayName}
                className="rounded-full object-cover"
              />
              <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                {fallbackInitial}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="text-sm font-medium text-default-800 capitalize ">
                {displayName}
              </div>
              <div className="text-xs text-default-600">
                {displayEmail}
              </div>
            </div>
          </DropdownMenuLabel>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuGroup>
            {userMenuItems.map((item, index) => (
              <Link
                href={item.href}
                key={`profile-menu-${index}`}
                className="cursor-pointer"
              >
                <DropdownMenuItem className="flex items-center gap-2 text-sm font-medium text-default-600 capitalize px-3 py-1.5 cursor-pointer">
                  <Icon icon={item.icon} className="w-4 h-4" />
                  {item.name}
                </DropdownMenuItem>
              </Link>
            ))}
          </DropdownMenuGroup>

          <DropdownMenuSeparator className="mb-0 dark:bg-background" />
          
          {/* Client-side logout */}
          <DropdownMenuItem className="flex items-center gap-2 text-sm font-medium text-default-600 capitalize my-1 px-3 cursor-pointer">
            <LogoutButton />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default ProfileInfo;


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
import { signOut, auth } from "@/lib/auth";
import Image from "next/image";
import { Link } from '@/i18n/routing';

const ProfileInfo = async () => {
  const session = await auth();
  
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
    }
  ];

  return (
    <div className="md:block hidden">
      <DropdownMenu>
        <DropdownMenuTrigger asChild className=" cursor-pointer">
          <div className=" flex items-center gap-3  text-default-800 ">
            <Image
              src={session?.user?.image as string}
              alt={session?.user?.name?.charAt(0) as string}
              width={36}
              height={36}
              className="rounded-full"
            />
            <div className="text-sm font-medium  capitalize lg:block hidden  ">
              {session?.user?.name}
            </div>
            <span className="text-base  me-2.5 lg:inline-block hidden">
              <Icon icon="heroicons-outline:chevron-down"></Icon>
            </span>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 p-0" align="end">
          <DropdownMenuLabel className="flex gap-2 items-center mb-1 p-3">
            <Image
              src={session?.user?.image as string}
              alt={session?.user?.name?.charAt(0) as string}
              width={36}
              height={36}
              className="rounded-full"
            />
            <div>
              <div className="text-sm font-medium text-default-800 capitalize ">
                {session?.user?.name}
              </div>
              <div className="text-xs text-default-600">
                {session?.user?.email}
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
          
          <DropdownMenuItem className="flex items-center gap-2 text-sm font-medium text-default-600 capitalize my-1 px-3 cursor-pointer">
            <div>
              <form
                action={async () => {
                  "use server";
                  await signOut();
                }}
              >
                <button type="submit" className=" w-full  flex  items-center gap-2" >
                  <Icon icon="heroicons:power" className="w-4 h-4" />
                  Log out
                </button>
              </form>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default ProfileInfo;

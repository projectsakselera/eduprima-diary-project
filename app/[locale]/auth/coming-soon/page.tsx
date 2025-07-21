
import { Link } from '@/i18n/routing';
import Logo from "@/components/partials/auth/logo";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import Image from "next/image";

const ComingSoonPage = () => {
  return (
    <div className="min-h-screen">
      <div className="xl:absolute left-0 top-0 w-full">
        <div className="flex flex-wrap justify-between items-center py-6 container">
          <div className="inline-block">
            <Logo />
          </div>
          <Button size="sm" variant="outline">
            Contact us
          </Button>
        </div>
      </div>
      <div className="container">
        <div className="flex justify-between flex-wrap items-center min-h-screen">
          <div className="xl:w-1/2 w-full">
            <div className="max-w-[520px]">
              <h1 className="text-5xl font-bold text-default-900 mb-6">
                Coming Soon
              </h1>
              <p className="text-xl text-default-600 mb-8">
                We&apos;re working hard to bring you something amazing. Stay tuned!
              </p>
              <div className="flex gap-4">
                <Input placeholder="Enter your email" className="max-w-[300px]" />
                <Button>Notify Me</Button>
              </div>
            </div>
          </div>
          <div className="xl:w-1/2 w-full">
            <Image
              src="/images/all-img/coming-soon.svg"
              alt="Coming Soon"
              width={500}
              height={500}
              className="w-full h-auto"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComingSoonPage;

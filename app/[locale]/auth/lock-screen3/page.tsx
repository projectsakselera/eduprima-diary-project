import Lock from "@/components/partials/auth/lock";
import { Link } from '@/i18n/routing';
import Image from "next/image";
import { Icon } from "@/components/ui/icon";

const LockScreen3 = () => {
  return (
    <div
      className="flex w-full items-center overflow-hidden min-h-dvh h-dvh basis-full bg-cover bg-no-repeat bg-center"
      style={{
        backgroundImage: `url(/images/all-img/login-bg.png)`,
      }} >
      <div className="overflow-y-auto flex flex-wrap w-full h-dvh">
        <div
          className="flex-1 overflow-hidden text-[40px] leading-[48px] text-default-600 lg:w-1/2 lg:block hidden">
          <div className="flex justify-center items-center min-h-screen">
            <Link href="/" className="flex gap-3 items-center text-white">
              <Icon icon="ph:graduation-cap" className="h-16 w-16" />
              <h1 className="text-3xl font-semibold">
                Eduprima Space
              </h1>
            </Link>
          </div>
        </div>
        <div className="lg:w-1/2 w-full flex flex-col items-center justify-center">
          <div className="bg-default-50  relative h-auto  lg:mr-[150px] mr-auto p-10 md:rounded-md max-w-[520px] w-full ml-auto text-2xl text-default-900  mb-3">
            <div className="flex justify-center items-center text-center mb-6 lg:hidden ">
              <Link href="/" className="flex gap-2 items-center">
                <Icon icon="ph:graduation-cap" className="text-primary h-12 w-12" />
                <h1 className="text-2xl font-semibold text-default-900">
                  Eduprima Diary
                </h1>
              </Link>
            </div>
                          <div className="text-center mb-10">
                <h4 className="font-medium mb-4">Lock Screen</h4>
                <div className="text-default-500 text-base">
                  🛡️ Protect your noble mission workspace
                </div>
              </div>
            <div className="author-bio text-center mt-10 mb-8">
              <div className="h-14 w-14 mx-auto rounded-full">
                <Image
                  height={300}
                  width={300}
                  src="/images/all-img/user-big.png"
                  alt=""
                  className="w-full h-full object-cover block"
                />
              </div>
              <div className="text-default-900  text-base font-medium mt-4">
                Kathryn Murphy
              </div>
            </div>
            <Lock />

            <div className="text-sm mx-auto w-full text-center font-normal text-default-500 mt-12 uppercase">
              Not you ? return
              <Link
                href="/auth/login"
                className="text-default-900  font-medium hover:underline px-2"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 lg:block hidden text-white py-5 px-5 text-xl w-full">
                          ⭐ Your Mission Continues{" "}
                <span className="text-white font-bold ms-1">Elevating Humanity</span>
        </div>
      </div>
    </div>
  );
};

export default LockScreen3;

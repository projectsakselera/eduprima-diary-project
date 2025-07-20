import { Link } from '@/i18n/routing';
import LoginForm from "@/components/partials/auth/login-form";
import Social from "@/components/partials/auth/social";
import Image from "next/image";
import Copyright from "@/components/partials/auth/copyright";
import { Icon } from "@/components/ui/icon";
const Login2 = () => {
  return (
    <>
      <div className="flex w-full items-center overflow-hidden min-h-dvh h-dvh basis-full">
        <div className="overflow-y-auto flex flex-wrap w-full h-dvh">
          <div className="flex-1 relative">
            <div className=" h-full flex flex-col bg-default-50">
              <div className="max-w-[524px] md:px-[42px] md:py-[44px] p-7  mx-auto w-full text-2xl text-default-900  mb-3 h-full flex flex-col justify-center">
                <div className="flex justify-center items-center text-center mb-6 lg:hidden ">
                  <Link href="/" className="flex gap-2 items-center">
                    <Icon icon="ph:graduation-cap" className="text-primary h-12 w-12" />
                    <h1 className="text-2xl font-semibold text-default-900">
                      Eduprima Space
                    </h1>
                  </Link>
                </div>
                                  <div className="text-center 2xl:mb-10 mb-4">
                    <h4 className="font-medium">Sign in</h4>
                    <div className="text-default-500  text-base">
                      🎯 Access your education dashboard
                    </div>
                  </div>
                <LoginForm />
                <div className=" relative border-b-[#9AA2AF] border-opacity-[16%] border-b pt-6">
                  <div className=" absolute inline-block  bg-default-50 dark:bg-default-100 left-1/2 top-1/2 transform -translate-x-1/2 px-4 min-w-max text-sm  text-default-500  font-normal ">
                    Or continue with
                  </div>
                </div>
                <div className="max-w-[242px] mx-auto mt-8 w-full">
                  <Social locale="en" />
                </div>
                <div className="md:max-w-[345px] mt-6 mx-auto font-normal text-default-500 md:mt-12 uppercase text-sm">
                  Don’t have an account?{" "}
                  <Link
                    href="/auth/register"
                    className="text-default-900  font-medium hover:underline"
                  >
                    Sign up
                  </Link>
                </div>
              </div>
              <div className="text-xs font-normal text-default-500 z-999 pb-10 text-center">
                <Copyright />
              </div>
            </div>
          </div>
          <div
            className="lg:block hidden flex-1 overflow-hidden text-[40px] leading-[48px] text-default-600  bg-cover bg-no-repeat bg-center"
            style={{
              backgroundImage: `url(/images/all-img/login-bg.png)`,
            }}
          >
            <div className="flex flex-col h-full justify-center">
              <div className="flex-1 flex flex-col justify-center items-center">
                <Link href="/" className="flex gap-3 items-center text-white">
                  <Icon icon="ph:graduation-cap" className="h-16 w-16" />
                  <h1 className="text-3xl font-semibold">
                    Eduprima Diary
                  </h1>
                </Link>
              </div>
              <div>
                <div
                  className="text-[40px] leading-[48px] text-white

 max-w-[525px] mx-auto pb-20 text-center"
                >
                                  ⭐ Your Mission Continues{" "}
                <span className="text-white font-bold ms-1">Elevating Humanity</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login2;

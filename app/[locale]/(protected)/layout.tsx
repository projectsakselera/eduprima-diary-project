import LayoutProvider from "@/providers/layout.provider";
import LayoutContentProvider from "@/providers/content.provider";
import DashCodeSidebar from '@/components/partials/sidebar'
import DashCodeFooter from '@/components/partials/footer'
import ConditionalCustomizer from '@/components/partials/customizer/conditional-customizer'
import DashCodeHeader from '@/components/partials/header'
import { auth } from "@/lib/auth";
import { redirect } from "@/components/navigation";
import { AuthProvider } from "@/lib/auth-context";

const layout = async ({ children }: { children: React.ReactNode }) => {
    const session = await auth();

    if (!session) {
        redirect({ href: '/', locale: 'en' })
    }
    return (
        <AuthProvider>
            <LayoutProvider >
                <ConditionalCustomizer />
                <DashCodeHeader />
                <DashCodeSidebar />
                <LayoutContentProvider>
                    {children}
                </LayoutContentProvider>
                <DashCodeFooter />
            </LayoutProvider>
        </AuthProvider>
    )
};

export default layout;

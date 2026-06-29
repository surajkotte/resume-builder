import Navbar from "@/components/navigation/navbar";
import { getLoggedinProfile } from "@/lib/getProfile";
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userProfile = await getLoggedinProfile();
  return (
    <div className="flex min-h-screen flex-col bg-gray-950 text-gray-100 font-sans antialiased">
      <Navbar profileData={userProfile} />
      <main className="flex flex-1 overflow-hidden">{children}</main>
    </div>
  );
}

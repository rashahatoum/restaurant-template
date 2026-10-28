import Footer from "@/components/layout/Footer";
import NavBar from "@/components/layout/NavBar";

// Public site shell. Routes outside (site), e.g. /lab or a future dashboard, don't get the NavBar/Footer.
export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <NavBar />
      {children}
      <Footer />
    </>
  );
}

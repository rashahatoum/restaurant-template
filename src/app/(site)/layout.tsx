import Footer from "@/components/layout/Footer";
import NavBar from "@/components/layout/NavBar";

// Public site shell. Routes outside (site), e.g. /lab or a future dashboard, don't get the NavBar/Footer.
// `modal` is the @modal slot: item details opened from a link, over the current page.
export default function SiteLayout({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode;
  modal: React.ReactNode;
}>) {
  return (
    <>
      <NavBar />
      {children}
      <Footer />
      {modal}
    </>
  );
}

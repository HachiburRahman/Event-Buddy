import Navbar from "@/components/shared/Navbar";
import Hero from "@/components/shared/Hero";
import EventList from "@/components/shared/EventList";
import Footer from "@/components/shared/Footer";
import CategoriesSection from "@/components/shared/CategoriesSection";
import SponsorsSection from "@/components/shared/SponsorsSection";
import TestimonialsSection from "@/components/shared/TestimonialsSection";
import NewsletterSection from "@/components/shared/NewsletterSection";

export default async function HomePage({ searchParams }: { searchParams: Promise<{ search?: string }> }) {
  const resolvedSearchParams = await searchParams;
  const search = resolvedSearchParams?.search || '';

  return (
    <>
      <Navbar />
      <main>
        <Hero initialSearch={search} />
        <CategoriesSection />
        <SponsorsSection />
        <EventList title={search ? `Search Results for "${search}" (Upcoming)` : "Upcoming Events"} type="upcoming" search={search} />
        <TestimonialsSection />
        <EventList title={search ? `Search Results for "${search}" (Past)` : "Previous Events"} type="past" search={search} />
        <NewsletterSection />
      </main>
      <Footer />
    </>
  );
}

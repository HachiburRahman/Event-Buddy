import Navbar from "@/components/shared/Navbar";
import Hero from "@/components/shared/Hero";
import EventList from "@/components/shared/EventList";
import Footer from "@/components/shared/Footer";

export default function HomePage({ searchParams }: { searchParams: { search?: string } }) {
  const search = searchParams?.search || '';

  return (
    <>
      <Navbar />
      <main>
        <Hero initialSearch={search} />
        <EventList title={search ? `Search Results for "${search}" (Upcoming)` : "Upcoming Events"} type="upcoming" search={search} />
        <EventList title={search ? `Search Results for "${search}" (Past)` : "Previous Events"} type="past" search={search} />
      </main>
      <Footer />
    </>
  );
}

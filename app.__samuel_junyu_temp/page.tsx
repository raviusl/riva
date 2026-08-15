import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Story from "@/components/Story";
import Timeline from "@/components/Timeline";
import Details from "@/components/Details";
import Venue from "@/components/Venue";
import RSVP from "@/components/RSVP";
import MusicPlayer from "@/components/MusicPlayer";

export default function Home() {
  return (
    <>
      <MusicPlayer />

      <Navbar />

      <main className="wedding-canvas">
        <Hero />
        <Story />
        <Timeline />
        <Details />
        <Venue />
        <RSVP />
      </main>
    </>
  );
}
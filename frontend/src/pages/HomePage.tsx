import { Hero } from "../components/home/Hero";
import { Resume } from "../components/home/Resume";
import { Roles } from "../components/home/Roles";
import { Leaderboard } from "../components/home/Leaderboard";
import { Skins } from "../components/home/Skins";
import { AppDownload } from "../components/home/AppDownload";

export function HomePage() {
  return (
    <>
      <Hero />
      <Resume />
      <Roles />
      <Leaderboard />
      <Skins />
      <AppDownload />
    </>
  );
}

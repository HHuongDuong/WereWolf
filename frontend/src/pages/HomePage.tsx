import { Hero } from "../components/Hero";
import { Resume } from "../components/Resume";
import { Roles } from "../components/Roles";
import { Leaderboard } from "../components/Leaderboard";
import { Skins } from "../components/Skins";
import { AppDownload } from "../components/AppDownload";

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

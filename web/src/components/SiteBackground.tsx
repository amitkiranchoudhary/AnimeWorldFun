// Fixed full-screen backdrop: an original night sky over the Captain's sea,
// drawn entirely in CSS (two drifting star layers, a soft moon glow and a
// colour wash), dimmed so foreground text stays readable.
const STARS_SMALL =
  "radial-gradient(1px 1px at 20px 30px, rgba(255,255,255,0.8), transparent), radial-gradient(1px 1px at 90px 120px, rgba(255,255,255,0.6), transparent), radial-gradient(1.5px 1.5px at 160px 60px, rgba(255,240,210,0.9), transparent), radial-gradient(1px 1px at 230px 180px, rgba(255,255,255,0.5), transparent), radial-gradient(1px 1px at 300px 90px, rgba(255,255,255,0.7), transparent), radial-gradient(1.2px 1.2px at 60px 220px, rgba(255,200,230,0.7), transparent)";
const STARS_BIG =
  "radial-gradient(2px 2px at 70px 80px, rgba(255,255,255,0.9), transparent), radial-gradient(2.2px 2.2px at 340px 260px, rgba(255,236,200,0.8), transparent), radial-gradient(1.8px 1.8px at 520px 120px, rgba(255,190,225,0.8), transparent)";

export default function SiteBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#0b0d1c]" aria-hidden>
      {/* deep night: indigo at the top, sea blue at the bottom */}
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,#0b0d1f_0%,#111530_45%,#0c1a2e_80%,#08121f_100%)]" />
      <div
        className="absolute -inset-[6%] opacity-70"
        style={{ backgroundImage: STARS_SMALL, backgroundSize: "340px 260px", animation: "bg-drift 90s ease-in-out infinite alternate" }}
      />
      <div
        className="absolute -inset-[6%] opacity-60"
        style={{ backgroundImage: STARS_BIG, backgroundSize: "620px 420px", animation: "bg-drift 140s ease-in-out infinite alternate-reverse" }}
      />
      {/* moon glow, colour wash + vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 82% 12%, rgba(255,244,214,0.12), transparent 22%), radial-gradient(ellipse at 50% 0%, rgba(230,57,70,0.14), transparent 55%), radial-gradient(ellipse at 50% 100%, rgba(31,95,143,0.28), transparent 60%), radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.7) 100%)",
        }}
      />
    </div>
  );
}

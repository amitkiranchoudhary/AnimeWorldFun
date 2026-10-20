// Fixed full-screen backdrop: the old site's chibi collage, slowly drifting,
// dimmed so foreground text stays readable.
export default function SiteBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#121212]" aria-hidden>
      <div
        className="absolute -inset-[6%] bg-cover bg-center opacity-45"
        style={{
          backgroundImage: "url(/images/bg-dark.png)",
          animation: "bg-drift 60s ease-in-out infinite alternate",
        }}
      />
      {/* colour wash + vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(230,57,70,0.18), transparent 55%), radial-gradient(ellipse at 50% 100%, rgba(31,95,143,0.25), transparent 60%), radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.75) 100%)",
        }}
      />
    </div>
  );
}

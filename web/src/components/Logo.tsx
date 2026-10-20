import Image from "next/image";
import logo from "../../public/images/logo.png";

/** The original Anime World Fun logo, sized for the navbar and footer. */
export function LogoMark({ className = "h-12 w-auto" }: { className?: string }) {
  return <Image src={logo} alt="Anime World Fun" className={className} priority />;
}

import type { Metadata } from "next";
import Image from "next/image";
import compass from "../../../public/images/compass.png";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "Captain's Login",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-20 text-center sm:px-6">
      <Image src={compass} alt="" className="h-auto w-24" style={{ animation: "compass-wobble 3s ease-in-out infinite" }} />
      <p className="mt-5 font-display text-lg tracking-wider text-sash">Owner only</p>
      <h1 className="title-stroke mt-1 text-5xl">Captain&apos;s Login</h1>
      <p className="mt-3 text-sm text-muted">This is where the site owner writes blogs and manages the site.</p>
      <LoginForm />
    </div>
  );
}

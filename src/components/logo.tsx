import { Fingerprint } from "lucide-react";
import { twMerge } from "tailwind-merge";

export default function Logo({
  className = "",
  theme = "dark",
}: {
  className?: string;
  theme?: "light" | "dark";
}) {
  return (
    <header
      className={twMerge(
        "text-xl flex gap-1 font-semibold",
        className,
        theme === "dark" ? "text-white" : "text-black"
      )}
    >
      <Fingerprint
        className={twMerge(
          "rotate-[20deg]",
          theme === "dark" ? "text-logo" : "text-black"
        )}
      />
      <p>myScore</p>
    </header>
  );
}

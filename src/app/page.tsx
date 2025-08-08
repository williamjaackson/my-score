import { Fingerprint } from "lucide-react";
import MyScore from "./components/MyScore";

export default function Home() {
  return (
    <>
      <div className="bg-secondary relative">
        <Fingerprint className="text-secondary-foreground absolute top-20 right-30 transform rotate-30 scale-1800" />
        <div className="text-white text-xl flex gap-1 font-semibold pl-6 pt-6 pb-3">
          <Fingerprint className="text-logo rotate-20" />
          <p>myScore</p>
        </div>
        <div className="bg-white rounded-3xl shadow-md p-6 mx-6 relative mb-6">
          <p className="font-semibold text-center text-3xl">William Jackson</p>
          <hr className="my-4 border-gray-200" />
          <MyScore />
        </div>
        <div className="bg-white rounded-t-3xl p-6 top-0 left-0 right-0 z-10 relative">
          a
        </div>
      </div>
    </>
  );
}

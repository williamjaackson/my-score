import {
  Fingerprint,
  Home as HomeIcon,
  FileText,
  MapPin,
  Users,
} from "lucide-react";
import MyScore from "./components/MyScore";

export default function Home() {
  return (
    <div className="bg-secondary grid min-h-screen relative">
      <div className="relative w-full pb-20">
        {/* Background Fingerprint */}
        <Fingerprint className="text-secondary-foreground absolute top-20 right-30 transform rotate-[30deg] scale-1600" />

        {/* Header */}
        <div className="text-white text-xl flex gap-1 font-semibold pl-6 pt-6 pb-3">
          <Fingerprint className="text-logo rotate-[20deg]" />
          <p>myScore</p>
        </div>

        {/* User Card */}
        <div className="bg-white rounded-3xl shadow-md p-6 mx-6 relative mb-6">
          <p className="font-semibold text-center text-3xl">William's Score</p>
          <hr className="my-4 border-gray-200" />
          <MyScore />
        </div>

        {/* Bottom Section */}
        <div className="bg-white rounded-t-3xl p-6 top-0 left-0 right-0 relative h-full">
          <p>Good Morning,</p>
          <p className="text-2xl font-semibold">William Jackson</p>
        </div>
      </div>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 max-w-lg mx-auto">
        <div className="flex justify-around items-center py-2">
          <button className="flex flex-col items-center text-blue-500">
            <HomeIcon size={24} />
            <span className="text-xs">Home</span>
          </button>
          {/* <button className="flex flex-col items-center text-gray-500 hover:text-blue-500">
            <FileText size={24} />
            <span className="text-xs">Report</span>
          </button> */}
          <button className="flex flex-col items-center text-gray-500 hover:text-blue-500">
            <MapPin size={24} />
            <span className="text-xs">Community</span>
          </button>
          <button className="flex flex-col items-center text-gray-500 hover:text-blue-500">
            <Users size={24} />
            <span className="text-xs">Friends</span>
          </button>
        </div>
      </nav>
    </div>
  );
}

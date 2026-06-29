"use client";

import { useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import {
  User,
  Settings,
  LogOut,
  Code,
  Calendar,
  Phone,
  FileText,
  GitBranch,
} from "lucide-react";

import { logout } from "@/app/(authActions)/actions";
import { ProfileModal } from "./ProfileModel";

export default function Navbar({ profileData }: { profileData: any }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-gray-800 bg-gray-950/80 px-6 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="bg-linear-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-xl font-bold tracking-tight text-transparent">
            Resume Builder
          </span>
        </div>

        {/* Right Side: User Avatar & Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-tr from-purple-600 to-blue-500 text-sm font-semibold text-white shadow-md transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-950"
          >
            US
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-gray-800 bg-gray-900 p-2 shadow-2xl">
              <div className="border-b border-gray-800 px-3 py-2">
                <p className="text-sm font-medium text-white">Suraj Kotte</p>
                <p className="truncate text-xs text-gray-400">
                  suraj@example.com
                </p>
              </div>

              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  setIsProfileModalOpen(true);
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-300 transition hover:bg-gray-800 hover:text-white"
              >
                <Settings className="h-4 w-4 text-gray-400" />
                Profile Settings
              </button>

              <button
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-400 transition hover:bg-red-500/10"
                onClick={logout}
              >
                <LogOut className="h-4 w-4" />
                Log Out
              </button>
            </div>
          )}
        </div>
      </header>

      <ProfileModal
        isProfileModalOpen={isProfileModalOpen}
        setIsProfileModalOpen={setIsProfileModalOpen}
        initialData={profileData}
      />
    </>
  );
}

"use client";

import React from "react";
import {
  Calendar,
  Phone,
  GitBranch,
  Code,
  Upload,
  X,
  FileText,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { useProfileForm } from "@/hooks/useProfileHook"; // Ensure path matches your hook location
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { saveProfile } from "@/app/(profileActions)/actions";

export function ProfileModal({
  isProfileModalOpen,
  setIsProfileModalOpen,
  initialData,
}: {
  isProfileModalOpen: boolean;
  setIsProfileModalOpen: (open: boolean) => void;
  initialData: any;
}) {
  // Destructure the upgraded hybrid state handlers from our custom hook
  const {
    profileData,
    handleInputChange,
    handleFileStage,
    handleRemoveDocument,
  } = useProfileForm(initialData);

  if (!isProfileModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = new FormData();
    payload.append("about", profileData.about);
    payload.append("age", profileData.age);
    payload.append("dob", profileData.dob);
    payload.append("phone", profileData.phone);
    payload.append("github", profileData.github);
    payload.append("skills", profileData.skills);

    // 1. Pack newly staged RAM files
    if (profileData.resumeFile) {
      payload.append("resume", profileData.resumeFile);
    }
    // 2. Pack explicit deletion signals for existing MySQL records
    if (profileData.resumeUrl === "DELETE_FLAG") {
      payload.append("deleteResume", "true");
    }

    if (profileData.cvFile) {
      payload.append("cv", profileData.cvFile);
    }
    if (profileData.cvUrl === "DELETE_FLAG") {
      payload.append("deleteCv", "true");
    }

    // Fire directly to your Next.js Server Action
    const response = await saveProfile(null, payload);

    if (response?.messageType === "success") {
      console.log("Profile & Documents successfully synchronized!");
      setIsProfileModalOpen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-gray-800 bg-[#131314] p-6 sm:p-8 shadow-2xl text-gray-100 custom-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-800/80 pb-5">
          <div>
            <h2 className="text-xl font-semibold text-white tracking-tight">
              Profile Settings
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Update your personal information and developer portfolio.
            </p>
          </div>
          <Button
            type="button"
            onClick={() => setIsProfileModalOpen(false)}
            variant="ghost"
            className="rounded-full h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-gray-800"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          {/* About Me */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300">
              About Me
            </label>
            <Textarea
              name="about"
              rows={5}
              value={profileData.about}
              onChange={handleInputChange}
              placeholder="Full-stack developer building AI applications..."
              className="w-full rounded-xl border border-gray-800 bg-[#1E1F20] p-3 text-sm text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all resize-none"
            />
          </div>

          {/* Personal Info Grid */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300">
                Age
              </label>
              <Input
                name="age"
                type="number"
                value={profileData.age}
                onChange={handleInputChange}
                placeholder="25"
                className="w-full rounded-xl border border-gray-800 bg-[#1E1F20] p-3 text-sm text-white placeholder:text-gray-500 focus:border-blue-500 focus:outline-none transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300">
                Date of Birth
              </label>
              <div className="relative flex items-center">
                <Calendar className="absolute left-3.5 h-4 w-4 text-gray-400 pointer-events-none" />
                <Input
                  name="dob"
                  type="date"
                  value={profileData.dob}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-gray-800 bg-[#1E1F20] p-3 pl-10 text-sm text-white placeholder:text-gray-500 focus:border-blue-500 focus:outline-none transition-all [scheme:dark]"
                />
              </div>
            </div>
          </div>

          {/* Contact & Social Grid */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300">
                Phone Number
              </label>
              <div className="relative flex items-center">
                <Phone className="absolute left-3.5 h-4 w-4 text-gray-400 pointer-events-none" />
                <Input
                  name="phone"
                  type="tel"
                  value={profileData.phone}
                  onChange={handleInputChange}
                  placeholder="+49 123 456789"
                  className="w-full rounded-xl border border-gray-800 bg-[#1E1F20] p-3 pl-10 text-sm text-white placeholder:text-gray-500 focus:border-blue-500 focus:outline-none transition-all"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300">
                GitHub Handle
              </label>
              <div className="relative flex items-center">
                <GitBranch className="absolute left-3.5 h-4 w-4 text-gray-400 pointer-events-none" />
                <Input
                  name="github"
                  type="text"
                  value={profileData.github}
                  onChange={handleInputChange}
                  placeholder="surajkotte"
                  className="w-full rounded-xl border border-gray-800 bg-[#1E1F20] p-3 pl-10 text-sm text-white placeholder:text-gray-500 focus:border-blue-500 focus:outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300">
              Programming Skills{" "}
              <span className="text-gray-500 font-normal">
                (Comma separated)
              </span>
            </label>
            <div className="relative flex items-center">
              <Code className="absolute left-3.5 h-4 w-4 text-gray-400 pointer-events-none" />
              <Input
                name="skills"
                type="text"
                value={profileData.skills}
                onChange={handleInputChange}
                placeholder="TypeScript, React, Next.js, Python, SQL"
                className="w-full rounded-xl border border-gray-800 bg-[#1E1F20] p-3 pl-10 text-sm text-white placeholder:text-gray-500 focus:border-blue-500 focus:outline-none transition-all"
              />
            </div>
          </div>

          <hr className="border-gray-800/80" />

          {/* Document Upload Section */}
          <div className="space-y-3 pt-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300">
              Career Documents
            </label>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* ================= RESUME SLOT ================= */}
              {profileData.resumeFile ? (
                /* STATE 1: Newly staged file in RAM ready for upload */
                <div className="relative flex items-center justify-between rounded-xl border border-emerald-500/50 bg-emerald-950/20 p-3.5">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
                    <div className="flex flex-col truncate">
                      <span className="truncate text-xs font-medium text-emerald-200">
                        {profileData.resumeFile.name}
                      </span>
                      <span className="text-[10px] text-emerald-400/80">
                        Ready to save •{" "}
                        {(profileData.resumeFile.size / 1024 / 1024).toFixed(2)}{" "}
                        MB
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => handleRemoveDocument(e, "resume")}
                    className="rounded-lg p-1 text-emerald-400 hover:bg-emerald-900/50 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : profileData.resumeUrl &&
                profileData.resumeUrl !== "DELETE_FLAG" ? (
                /* STATE 2: Hydrated document existing safely in Cloud / MySQL */
                <div className="relative flex items-center justify-between rounded-xl border border-blue-500/30 bg-[#1E1F20] p-3.5">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <FileText className="h-5 w-5 shrink-0 text-blue-400" />
                    <div className="flex flex-col truncate">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                        Active Resume
                      </span>
                      <a
                        href={profileData.resumeUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 truncate text-xs font-medium text-blue-300 hover:underline"
                      >
                        <span className="truncate">
                          {profileData.resumeUrl.split("/").pop()}
                        </span>
                        <ExternalLink className="h-3 w-3 shrink-0 inline" />
                      </a>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => handleRemoveDocument(e, "resume")}
                    className="rounded-lg p-1 text-gray-400 hover:bg-gray-800 hover:text-red-400 transition-colors"
                    title="Delete saved document"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                /* STATE 3: Empty Dropzone */
                <div className="group relative flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-700 bg-[#1E1F20]/50 p-4 transition-all hover:border-blue-500 hover:bg-[#1E1F20] cursor-pointer">
                  <input
                    type="file"
                    onChange={(e) => handleFileStage(e, "resume")}
                    className="absolute inset-0 z-10 opacity-0 cursor-pointer"
                    accept=".pdf,.docx"
                  />
                  <Upload className="mb-2 h-5 w-5 text-gray-400 transition-colors group-hover:text-blue-400" />
                  <span className="text-xs font-medium text-gray-300">
                    Upload Resume
                  </span>
                  <span className="mt-0.5 text-[10px] text-gray-500">
                    PDF or DOCX up to 5MB
                  </span>
                </div>
              )}

              {/* ================= CV SLOT ================= */}
              {profileData.cvFile ? (
                /* STATE 1: Newly staged file in RAM */
                <div className="relative flex items-center justify-between rounded-xl border border-emerald-500/50 bg-emerald-950/20 p-3.5">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
                    <div className="flex flex-col truncate">
                      <span className="truncate text-xs font-medium text-emerald-200">
                        {profileData.cvFile.name}
                      </span>
                      <span className="text-[10px] text-emerald-400/80">
                        Ready to save •{" "}
                        {(profileData.cvFile.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => handleRemoveDocument(e, "cv")}
                    className="rounded-lg p-1 text-emerald-400 hover:bg-emerald-900/50 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : profileData.cvUrl && profileData.cvUrl !== "DELETE_FLAG" ? (
                /* STATE 2: Hydrated existing cloud document */
                <div className="relative flex items-center justify-between rounded-xl border border-blue-500/30 bg-[#1E1F20] p-3.5">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <FileText className="h-5 w-5 shrink-0 text-blue-400" />
                    <div className="flex flex-col truncate">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                        Active Curriculum Vitae
                      </span>
                      <a
                        href={profileData.cvUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 truncate text-xs font-medium text-blue-300 hover:underline"
                      >
                        <span className="truncate">
                          {profileData.cvUrl.split("/").pop()}
                        </span>
                        <ExternalLink className="h-3 w-3 shrink-0 inline" />
                      </a>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => handleRemoveDocument(e, "cv")}
                    className="rounded-lg p-1 text-gray-400 hover:bg-gray-800 hover:text-red-400 transition-colors"
                    title="Delete saved document"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                /* STATE 3: Empty Dropzone */
                <div className="group relative flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-700 bg-[#1E1F20]/50 p-4 transition-all hover:border-blue-500 hover:bg-[#1E1F20] cursor-pointer">
                  <input
                    type="file"
                    onChange={(e) => handleFileStage(e, "cv")}
                    className="absolute inset-0 z-10 opacity-0 cursor-pointer"
                    accept=".pdf,.docx"
                  />
                  <Upload className="mb-2 h-5 w-5 text-gray-400 transition-colors group-hover:text-blue-400" />
                  <span className="text-xs font-medium text-gray-300">
                    Upload CV
                  </span>
                  <span className="mt-0.5 text-[10px] text-gray-500">
                    PDF or DOCX up to 5MB
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-800/80">
            <Button
              type="button"
              onClick={() => setIsProfileModalOpen(false)}
              variant="secondary"
              className="rounded-xl bg-transparent border border-gray-700 hover:bg-gray-800 text-gray-300 px-5 py-2.5 text-sm font-medium transition-all"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="rounded-xl bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 text-sm font-medium shadow-lg shadow-blue-600/20 transition-all"
            >
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

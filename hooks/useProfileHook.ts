import { useState } from "react";

// 1. Separate database strings from browser RAM binaries
export interface UserProfileState {
  about: string;
  age: string;
  dob: string;
  phone: string;
  github: string;
  skills: string;

  // Hydrated URLs sitting safely in MySQL / MinIO
  resumeUrl: string | null;
  cvUrl: string | null;

  // Newly staged binary files sitting in browser RAM
  resumeFile: File | null;
  cvFile: File | null;
}

export function useProfileForm(initialData?: any) {
  const [profileData, setProfileData] = useState<UserProfileState>({
    about: initialData?.about || "",
    age: initialData?.age ? String(initialData.age) : "",
    dob: initialData?.dob || "",
    phone: initialData?.phone || "",
    github: initialData?.github || "",
    skills: initialData?.skills || "",

    // Map backend database columns to URL previews
    resumeUrl: initialData?.resume_url || null,
    cvUrl: initialData?.cv_url || null,

    // Always initialize new file picks as null
    resumeFile: null,
    cvFile: null,
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileStage = (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldName: "resume" | "cv",
  ) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;

    setProfileData((prev) => ({
      ...prev,
      [`${fieldName}File`]: file, // Stage binary for upload
      [`${fieldName}Url`]: null, // Temporarily hide old DB preview
    }));
  };

  const handleRemoveDocument = (
    e: React.MouseEvent,
    fieldName: "resume" | "cv",
  ) => {
    e.preventDefault();
    e.stopPropagation();

    setProfileData((prev) => ({
      ...prev,
      [`${fieldName}File`]: null,
      // Flag instructs the Next.js Server Action to wipe the MySQL column
      [`${fieldName}Url`]: "DELETE_FLAG",
    }));
  };

  return {
    profileData,
    handleInputChange,
    handleFileStage,
    handleRemoveDocument,
  };
}

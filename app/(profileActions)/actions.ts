"use server";

import { sqldb } from "@/lib/dbConnection";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import JWT, { JwtPayload } from "jsonwebtoken";
import { uploadToS3 } from "@/lib/s3Connections";

interface UserTokenPayload extends JwtPayload {
  id: string;
}

export async function saveProfile(prevState: any, formData: FormData) {
  // 1. Verify Authentication from the Cookie Gatekeeper
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    redirect("/login");
  }

  // Decode JWT to retrieve the logged-in user's ID
  const decoded = JWT.verify(
    token,
    process.env.JWT_SECRET! || 'hellothere',
  ) as UserTokenPayload;

  const userId = decoded?.id;

  if (!userId) {
    return {
      messageType: "error",
      message: "Invalid user authentication token.",
    };
  }

  // 2. Extract standard text inputs
  const about = formData.get("about") as string;
  const ageString = formData.get("age") as string;
  const dob = formData.get("dob") as string;
  const phone = formData.get("phone") as string;
  const github = formData.get("github") as string;
  const skills = formData.get("skills") as string;

  // Cast Age strictly to an Integer for MySQL TINYINT
  const age = ageString ? parseInt(ageString, 10) : null;

  // 3. Extract & Stream Files to AWS S3 Cloud Storage
  const resumeFile = formData.get("resume") as File | null;
  const cvFile = formData.get("cv") as File | null;

  let resumeUrl: string | null = null;
  let cvUrl: string | null = null;

  if (resumeFile && resumeFile.size > 0) {
    const bytes = await resumeFile.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Sanitize filename to prevent routing errors
    const sanitizedName = resumeFile.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const fileName = `${uuidv4()}-${sanitizedName}`;

    const { httpUrl } = await uploadToS3(fileName, buffer, resumeFile.type);
    resumeUrl = httpUrl; // MySQL stores strictly the accessible S3 URL string
  }

  if (cvFile && cvFile.size > 0) {
    const bytes = await cvFile.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const sanitizedName = cvFile.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const fileName = `${uuidv4()}-${sanitizedName}`;

    const { httpUrl } = await uploadToS3(fileName, buffer, cvFile.type);
    cvUrl = httpUrl;
  }

  // 4. Upsert into MySQL (Insert new, or Update existing profile)
  try {
    const query = `
      INSERT INTO user_profiles 
        (user_id, about, age, dob, phone, github, skills, resume_url, cv_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        about = VALUES(about),
        age = VALUES(age),
        dob = VALUES(dob),
        phone = VALUES(phone),
        github = VALUES(github),
        skills = VALUES(skills),
        resume_url = COALESCE(VALUES(resume_url), resume_url),
        cv_url = COALESCE(VALUES(cv_url), cv_url);
    `;

    await sqldb.execute(query, [
      userId,
      about || null,
      age,
      dob || null,
      phone || null,
      github || null,
      skills || null,
      resumeUrl,
      cvUrl,
    ]);

    return { messageType: "success", message: "Profile saved successfully!" };
  } catch (error) {
    console.error("MySQL Profile Error:", error);
    return { messageType: "error", message: "Database failure occurred." };
  }
}

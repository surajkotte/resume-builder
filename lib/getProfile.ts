import { cookies } from "next/headers";
import JWT, { JwtPayload } from "jsonwebtoken";
import { sqldb } from "@/lib/dbConnection";

interface UserTokenPayload extends JwtPayload {
  id: string;
}

export async function getLoggedinProfile() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) return null;

  try {
    const decoded = JWT.verify(
      token,
      process.env.JWT_SECRET!,
    ) as UserTokenPayload;
    const userId = decoded.id;

    const [rows]: any = await sqldb.execute(
      `SELECT 
        u.username, 
        u.email_address, 
        p.about, 
        p.age, 
        p.dob, 
        p.phone, 
        p.github, 
        p.skills, 
        p.resume_url, 
        p.cv_url 
      FROM users u 
      LEFT JOIN user_profiles p ON u.id = p.user_id 
      WHERE u.id = ? LIMIT 1`,
      [userId],
    );

    return rows[0] || null;
  } catch (error) {
    console.error("Failed to fetch user profile:", error);
    return null;
  }
}

import { Button } from "@/components/ui/button";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v2.97h3.86c2.26-2.09 3.56-5.17 3.56-8.79z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-2.97c-1.08.73-2.46 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.27v3.09C3.26 21.3 7.31 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.32c-.25-.73-.39-1.51-.39-2.32s.14-1.59.39-2.32V6.59H1.27A11.97 11.97 0 0 0 0 12c0 1.93.46 3.76 1.27 5.41l4-3.09z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.27 6.59l4 3.09c.95-2.85 3.6-4.93 6.73-4.93z"
      />
    </svg>
  );
}

function GithubIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
      <path d="M12 0C5.37 0 0 5.45 0 12.18c0 5.39 3.44 9.95 8.21 11.57.6.11.82-.27.82-.59 0-.29-.01-1.27-.02-2.3-3.34.74-4.04-1.46-4.04-1.46-.55-1.42-1.34-1.8-1.34-1.8-1.09-.76.08-.74.08-.74 1.2.09 1.84 1.26 1.84 1.26 1.08 1.87 2.83 1.33 3.52 1.02.11-.79.42-1.33.76-1.64-2.66-.31-5.47-1.36-5.47-6.06 0-1.34.46-2.43 1.22-3.29-.12-.31-.53-1.55.12-3.23 0 0 1-.33 3.3 1.25a11.3 11.3 0 0 1 6 0c2.3-1.58 3.3-1.25 3.3-1.25.65 1.68.24 2.92.12 3.23.76.86 1.22 1.95 1.22 3.29 0 4.71-2.81 5.75-5.49 6.05.43.38.81 1.13.81 2.28 0 1.65-.01 2.97-.01 3.38 0 .32.22.71.83.59C20.56 22.12 24 17.56 24 12.18 24 5.45 18.63 0 12 0z" />
    </svg>
  );
}

interface SocialButtonsProps {
  onGoogleClick?: () => void;
  onGithubClick?: () => void;
  loadingProvider?: "google" | "github" | null;
}

export function SocialButtons({
  onGoogleClick,
  onGithubClick,
  loadingProvider,
}: SocialButtonsProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={onGoogleClick}
        loading={loadingProvider === "google"}
      >
        <GoogleIcon />
        Google
      </Button>
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={onGithubClick}
        loading={loadingProvider === "github"}
      >
        <GithubIcon />
        GitHub
      </Button>
    </div>
  );
}
import Link from "next/link";

interface GatedContentProps {
  isAuthenticated: boolean;
  children: React.ReactNode;
  message?: string;
}

export default function GatedContent({
  isAuthenticated,
  children,
  message = "Sign up to access detailed acquisition intelligence",
}: GatedContentProps) {
  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      {/* Blurred preview of content */}
      <div className="blur-sm opacity-50 pointer-events-none select-none">
        {children}
      </div>

      {/* Overlay with CTA */}
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-white via-white/80 to-transparent">
        <div className="text-center px-6 py-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#14b8a6]/10 mb-4">
            <svg
              className="w-6 h-6 text-[#14b8a6]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h3 className="text-[17px] font-semibold text-[#1d1d1f] mb-2">
            Premium Content
          </h3>
          <p className="text-[14px] text-[#6e6e73] mb-5 max-w-[280px]">
            {message}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/register" className="btn-primary text-[14px] py-2.5 px-5">
              Create Free Account
            </Link>
            <Link
              href="/login"
              className="btn-secondary text-[14px] py-2.5 px-5"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

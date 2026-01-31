import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-black flex font-sans selection:bg-orange-500/30">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-black border-r border-gray-800 p-12 flex-col justify-between relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-600/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-orange-900/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-600/20">
              <span className="text-white font-bold text-xl">O</span>
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">OutboundOS</span>
          </Link>
        </div>

        <div className="relative z-10 space-y-8">
          <h1 className="text-5xl font-extrabold text-white leading-[1.15] tracking-tight">
            Automate your outreach.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">
              Close more deals.
            </span>
          </h1>
          <p className="text-lg text-gray-400 max-w-md leading-relaxed">
            AI-powered outbound automation that helps you find prospects,
            personalize messages, and convert leads into customers.
          </p>

          <div className="flex items-center gap-8 pt-8 border-t border-gray-800/60">
            <div>
              <p className="text-3xl font-bold text-white">10x</p>
              <p className="text-sm text-gray-500 font-medium mt-1">More responses</p>
            </div>
            <div className="w-px h-12 bg-gray-800" />
            <div>
              <p className="text-3xl font-bold text-white">50%</p>
              <p className="text-sm text-gray-500 font-medium mt-1">Time saved</p>
            </div>
            <div className="w-px h-12 bg-gray-800" />
            <div>
              <p className="text-3xl font-bold text-white">3x</p>
              <p className="text-sm text-gray-500 font-medium mt-1">Conversion rate</p>
            </div>
          </div>
        </div>

        <p className="relative z-10 text-sm text-gray-600 font-medium">
          Trusted by 1000+ sales teams worldwide
        </p>
      </div>

      {/* Right side - Auth form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-black">
        <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-8 duration-500">
          {children}
        </div>
      </div>
    </div>
  );
}

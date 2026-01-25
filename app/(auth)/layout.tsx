import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-orange-50 to-orange-100 p-12 flex-col justify-between">
        <div>
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">O</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">OutboundOS</span>
          </Link>
        </div>

        <div className="space-y-6">
          <h1 className="text-4xl font-bold text-gray-900 leading-tight">
            Automate your outreach.
            <br />
            <span className="text-orange-500">Close more deals.</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-md">
            AI-powered outbound automation that helps you find prospects,
            personalize messages, and convert leads into customers.
          </p>

          <div className="flex items-center gap-8 pt-4">
            <div>
              <p className="text-3xl font-bold text-gray-900">10x</p>
              <p className="text-sm text-gray-500">More responses</p>
            </div>
            <div className="w-px h-12 bg-gray-300" />
            <div>
              <p className="text-3xl font-bold text-gray-900">50%</p>
              <p className="text-sm text-gray-500">Time saved</p>
            </div>
            <div className="w-px h-12 bg-gray-300" />
            <div>
              <p className="text-3xl font-bold text-gray-900">3x</p>
              <p className="text-sm text-gray-500">Conversion rate</p>
            </div>
          </div>
        </div>

        <p className="text-sm text-gray-500">
          Trusted by 1000+ sales teams worldwide
        </p>
      </div>

      {/* Right side - Auth form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}

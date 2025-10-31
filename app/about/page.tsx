import Card from '@/components/ui/Card';

export default function About() {
  return (
    <div className="py-20 md:py-28 bg-linear-to-b from-white via-slate-50 to-white">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center mb-20">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 bg-linear-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent leading-tight">
            About GOY eSIM
          </h1>
          <p className="text-xl md:text-2xl text-slate-600 font-medium leading-relaxed">
            We&apos;re revolutionizing global connectivity by making eSIM technology accessible to everyone.
          </p>
        </div>

        {/* Mission Section */}
        <div className="max-w-5xl mx-auto mb-20">
          <Card className="bg-linear-to-br from-green-50 to-emerald-50">
            <h2 className="text-4xl font-extrabold mb-6 text-slate-900">Our Mission</h2>
            <p className="text-lg text-slate-600 mb-5 leading-relaxed">
              At GOY eSIM, we believe that staying connected shouldn&apos;t be complicated or expensive. 
              Our mission is to provide seamless, affordable, and instant connectivity solutions for 
              travelers and digital nomads worldwide.
            </p>
            <p className="text-lg text-slate-600 leading-relaxed">
              We eliminate the hassle of hunting for local SIM cards, dealing with roaming charges, 
              and managing multiple phone numbers. With our eSIM marketplace, you can connect to 
              networks in over 190 countries with just a few taps.
            </p>
          </Card>
        </div>

        {/* Values Section */}
        <div className="max-w-5xl mx-auto mb-20">
          <h2 className="text-4xl md:text-5xl font-extrabold text-center mb-4 text-slate-900">Our Values</h2>
          <p className="text-center text-slate-600 mb-12 text-lg">What drives us every day</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card hover className="text-center group">
              <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform duration-300">🎯</div>
              <h3 className="text-2xl font-bold mb-3 text-slate-900">Simplicity</h3>
              <p className="text-slate-600 leading-relaxed">
                We make connectivity simple. No technical jargon, no complicated setup - just instant activation.
              </p>
            </Card>
            <Card hover className="text-center group">
              <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform duration-300">💎</div>
              <h3 className="text-2xl font-bold mb-3 text-slate-900">Transparency</h3>
              <p className="text-slate-600 leading-relaxed">
                Clear pricing, no hidden fees. What you see is what you pay - it's that straightforward.
              </p>
            </Card>
            <Card hover className="text-center group">
              <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform duration-300">🚀</div>
              <h3 className="text-2xl font-bold mb-3 text-slate-900">Innovation</h3>
              <p className="text-slate-600 leading-relaxed">
                We&apos;re constantly improving our platform to provide you with the best connectivity experience.
              </p>
            </Card>
          </div>
        </div>

        {/* Story Section */}
        <div className="max-w-5xl mx-auto mb-20">
          <Card>
            <h2 className="text-4xl font-extrabold mb-6 text-slate-900">Our Story</h2>
            <p className="text-lg text-slate-600 mb-5 leading-relaxed">
              Founded in 2024, GOY eSIM was born from the frustration of dealing with traditional 
              SIM cards while traveling. Our founders, frequent travelers themselves, experienced 
              firsthand the pain of switching SIM cards, losing connectivity, and paying exorbitant 
              roaming fees.
            </p>
            <p className="text-lg text-slate-600 leading-relaxed">
              Today, we&apos;re proud to serve thousands of customers worldwide, providing them with 
              instant connectivity and the freedom to stay connected wherever their journey takes them.
            </p>
          </Card>
        </div>

        {/* Stats Section */}
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <Card hover className="group">
              <div className="text-5xl font-extrabold bg-linear-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-3 transform group-hover:scale-110 transition-transform duration-300">190+</div>
              <p className="text-slate-600 font-semibold">Countries</p>
            </Card>
            <Card hover className="group">
              <div className="text-5xl font-extrabold bg-linear-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-3 transform group-hover:scale-110 transition-transform duration-300">10K+</div>
              <p className="text-slate-600 font-semibold">Active Users</p>
            </Card>
            <Card hover className="group">
              <div className="text-5xl font-extrabold bg-linear-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent mb-3 transform group-hover:scale-110 transition-transform duration-300">50K+</div>
              <p className="text-slate-600 font-semibold">eSIMs Activated</p>
            </Card>
            <Card hover className="group">
              <div className="text-5xl font-extrabold bg-linear-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-3 transform group-hover:scale-110 transition-transform duration-300">4.9/5</div>
              <p className="text-slate-600 font-semibold">User Rating</p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}



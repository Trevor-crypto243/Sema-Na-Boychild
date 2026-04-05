import Link from "next/link";
import { Heart, Users, School, Calendar, BookOpen, Shield, Star, Mail, Phone, MapPin } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F1EFEA]">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1B4332]">
              <Heart className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-[#1B4332]">Sema Na Boychild</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#about" className="text-sm font-medium text-gray-600 hover:text-[#1B4332]">About</a>
            <a href="#programs" className="text-sm font-medium text-gray-600 hover:text-[#1B4332]">Programs</a>
            <a href="#impact" className="text-sm font-medium text-gray-600 hover:text-[#1B4332]">Impact</a>
            <a href="#testimonials" className="text-sm font-medium text-gray-600 hover:text-[#1B4332]">Testimonials</a>
            <a href="#contact" className="text-sm font-medium text-gray-600 hover:text-[#1B4332]">Contact</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-[#1B4332] hover:underline">Admin</Link>
            <a href="#donate" className="rounded-lg bg-[#C1662D] px-4 py-2 text-sm font-medium text-white hover:bg-[#C1662D]/90">
              Donate Now
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#1B4332] py-24 text-white">
        <div className="mx-auto max-w-6xl px-6">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold leading-tight md:text-6xl">
              Every Boy Deserves a <span className="text-[#D4A373]">Voice</span>
            </h1>
            <p className="mt-6 text-lg text-white/80">
              Young men are in crisis. They are falling behind academically, emotionally, and socially.
              Sema Na Boychild exists to mentor, guide, and empower the boy-child through school visits,
              seminars, and dedicated mentorship programs across Kenya.
            </p>
            <div className="mt-8 flex gap-4">
              <a href="#donate" className="rounded-lg bg-[#C1662D] px-6 py-3 font-medium text-white hover:bg-[#C1662D]/90">
                Donate Now
              </a>
              <a href="#about" className="rounded-lg border border-white/30 px-6 py-3 font-medium text-white hover:bg-white/10">
                Learn More
              </a>
            </div>
          </div>
        </div>
        <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-[#D4A373]/20" />
        <div className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-[#C1662D]/20" />
      </section>

      {/* Impact Numbers */}
      <section id="impact" className="border-b bg-white py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {[
              { value: "300+", label: "Boys Mentored", icon: Users },
              { value: "12", label: "Schools Partnered", icon: School },
              { value: "5", label: "Communities Reached", icon: MapPin },
              { value: "25+", label: "Events Held", icon: Calendar },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <stat.icon className="mx-auto h-8 w-8 text-[#C1662D]" />
                <div className="mt-3 text-3xl font-bold text-[#1B4332]">{stat.value}</div>
                <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-[#1B4332]">Why This Matters</h2>
            <p className="mx-auto mt-4 max-w-2xl text-gray-600">
              The focus has shifted disproportionately, leaving boys without the support structures they need.
              The society we are looking at is not the best society we could have. We are changing that, one boy at a time.
            </p>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {[
              {
                title: "The Crisis",
                desc: "Boys are dropping out of school, engaging in substance abuse, and lacking positive role models. Mental health issues among young men are at an all-time high.",
                icon: Shield,
              },
              {
                title: "Our Approach",
                desc: "We visit schools, conduct seminars, and pair boys with mentors who guide them through emotional development, leadership training, and career planning.",
                icon: Heart,
              },
              {
                title: "The Impact",
                desc: "Boys who go through our program show improved academic performance, better emotional regulation, and stronger leadership skills.",
                icon: Star,
              },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl bg-white p-8 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#1B4332]/10">
                  <item.icon className="h-6 w-6 text-[#1B4332]" />
                </div>
                <h3 className="mt-4 text-xl font-bold text-[#1B4332]">{item.title}</h3>
                <p className="mt-2 text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section id="programs" className="bg-white py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center text-3xl font-bold text-[#1B4332]">Our Programs</h2>
          <p className="mx-auto mt-4 max-w-xl text-center text-gray-600">
            Comprehensive mentorship programs designed to build strong, capable young men
          </p>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                title: "Emotional Development",
                desc: "Teaching boys to understand, express, and manage their emotions in healthy ways. Breaking the stigma around male vulnerability.",
                icon: Heart,
                color: "bg-[#C1662D]",
              },
              {
                title: "Leadership Training",
                desc: "Building confidence, public speaking, teamwork, and decision-making skills that prepare boys to lead in their communities.",
                icon: Shield,
                color: "bg-[#1B4332]",
              },
              {
                title: "Career & Purpose",
                desc: "Helping boys discover their passions, set goals, and build practical skills for their future careers and life purpose.",
                icon: BookOpen,
                color: "bg-[#D4A373]",
              },
            ].map((program) => (
              <div key={program.title} className="group rounded-2xl border p-8 transition-all hover:shadow-lg">
                <div className={`flex h-14 w-14 items-center justify-center rounded-xl ${program.color}`}>
                  <program.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="mt-6 text-xl font-bold text-[#1B4332]">{program.title}</h3>
                <p className="mt-3 text-gray-600">{program.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center text-3xl font-bold text-[#1B4332]">What People Say</h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              { name: "James Ochieng", role: "Mentor", quote: "Watching these boys transform from shy, uncertain teenagers into confident young men with clear goals has been the most rewarding experience of my life." },
              { name: "Mary Wanjiku", role: "Parent", quote: "My son was struggling in school and at home. Since joining the program, he has become more focused, respectful, and driven. I cannot thank Sema Na Boychild enough." },
              { name: "Brian Kiprop", role: "Mentee", quote: "Before the program, I did not believe in myself. My mentor showed me that I have potential and helped me set goals for the first time in my life." },
            ].map((t) => (
              <div key={t.name} className="rounded-2xl bg-white p-8 shadow-sm">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-[#D4A373] text-[#D4A373]" />
                  ))}
                </div>
                <p className="mt-4 text-gray-600 italic">&quot;{t.quote}&quot;</p>
                <div className="mt-6">
                  <p className="font-semibold text-[#1B4332]">{t.name}</p>
                  <p className="text-sm text-muted-foreground">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Donate Section */}
      <section id="donate" className="bg-[#1B4332] py-20 text-white">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <h2 className="text-3xl font-bold">Support the Boy-Child</h2>
          <p className="mx-auto mt-4 max-w-xl text-white/80">
            Your donation directly funds school visits, seminars, mentorship materials, and programs
            that transform young lives. Every shilling counts.
          </p>
          <div className="mx-auto mt-8 flex max-w-lg flex-wrap justify-center gap-3">
            {["500", "1,000", "2,500", "5,000"].map((amt) => (
              <button key={amt} className="rounded-lg border border-white/30 px-6 py-3 font-medium hover:bg-white/10 transition-colors">
                KES {amt}
              </button>
            ))}
            <button className="rounded-lg border border-white/30 px-6 py-3 font-medium hover:bg-white/10 transition-colors">
              Custom
            </button>
          </div>
          <div className="mx-auto mt-8 flex max-w-sm flex-col gap-3">
            <button className="rounded-lg bg-[#4CAF50] px-6 py-3 font-medium text-white hover:bg-[#4CAF50]/90">
              Donate via M-Pesa
            </button>
            <button className="rounded-lg bg-[#635BFF] px-6 py-3 font-medium text-white hover:bg-[#635BFF]/90">
              Donate via Card (International)
            </button>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="bg-white py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-12 md:grid-cols-2">
            <div>
              <h2 className="text-3xl font-bold text-[#1B4332]">Get In Touch</h2>
              <p className="mt-4 text-gray-600">
                Want to partner with us, volunteer as a mentor, or learn more about our programs? Reach out.
              </p>
              <div className="mt-8 space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-[#C1662D]" />
                  <span>info@semanaboychild.org</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-[#C1662D]" />
                  <span>+254 700 000 000</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-[#C1662D]" />
                  <span>Nairobi, Kenya</span>
                </div>
              </div>
              <div className="mt-8 flex gap-4">
                {["TikTok", "Instagram", "Facebook", "YouTube"].map(p => (
                  <span key={p} className="rounded-lg bg-[#1B4332]/10 px-3 py-2 text-xs font-medium text-[#1B4332]">{p}</span>
                ))}
              </div>
            </div>
            <div>
              <form className="space-y-4 rounded-2xl bg-[#F1EFEA] p-8">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Name</label>
                    <input className="mt-1 w-full rounded-lg border px-4 py-2 text-sm" placeholder="Your name" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <input className="mt-1 w-full rounded-lg border px-4 py-2 text-sm" type="email" placeholder="you@example.com" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Phone</label>
                  <input className="mt-1 w-full rounded-lg border px-4 py-2 text-sm" placeholder="+254..." />
                </div>
                <div>
                  <label className="text-sm font-medium">Subject</label>
                  <input className="mt-1 w-full rounded-lg border px-4 py-2 text-sm" placeholder="How can we help?" />
                </div>
                <div>
                  <label className="text-sm font-medium">Message</label>
                  <textarea className="mt-1 w-full rounded-lg border px-4 py-2 text-sm" rows={4} placeholder="Your message..." />
                </div>
                <button type="submit" className="w-full rounded-lg bg-[#1B4332] px-6 py-3 font-medium text-white hover:bg-[#1B4332]/90">
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-[#1B4332] py-12 text-white">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              <span className="font-bold">Sema Na Boychild</span>
            </div>
            <p className="text-sm text-white/60">
              &copy; 2026 Sema Na Boychild. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

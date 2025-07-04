"use client";
import Image from 'next/image';
import Link from "next/link";
import { useState, useRef, useEffect } from 'react';
import { FaInfoCircle, FaBook, FaChalkboardTeacher, FaPhone, FaLifeRing, FaEllipsisH } from 'react-icons/fa';
import { ChevronRight } from 'lucide-react';
import { Home } from '@/components/homenav'
// Reusable components
const TestimonialCard = ({ content, icon, headline, rotation }) => (
  <div className={`bg-gradient-to-r from-[#347BFF] to-[#2566E2] border border-white rounded-xl p-6 ${rotation} w-full md:w-110 mx-2 md:mx-0 h-full`}>
    <p className="text-white text-sm font-light leading-relaxed">
      {content}
    </p>
    <div className="flex items-center mt-4">
      <img src={icon} alt={headline} className="w-6 h-6 mr-2" />
      <h3 className="text-white font-semibold text-lg">{headline}</h3>
    </div>
  </div>
);

interface ScrollingColumnProps {
  direction: "scroll-up" | "scroll-down";
  speed?: number;
  count?: number;
  className?: string;
}

const ScrollingColumn: React.FC<ScrollingColumnProps> = ({ direction, count = 15, className }) => {
  const isUp = direction === "scroll-up";
  const items = new Array(count).fill(0);

  return (
    <div className={`relative h-[800px] w-[150px] overflow-hidden ${className}`}>
      <div className={`flex flex-col gap-4 ${isUp ? "scroll-up" : "scroll-down"}`}>
        {items.map((_, i) => (
          <img
            key={i}
            src="/Page.png"
            className="rounded-2xl w-full object-cover"
            alt={`scroll-page-${i}`}
          />
        ))}
        {items.map((_, i) => (
          <img
            key={`dup-${i}`}
            src="/Page.png"
            className="rounded-2xl w-full object-cover"
            alt={`scroll-page-dup-${i}`}
          />
        ))}
      </div>
    </div>
  );
};

// Dropdown component
const NavDropdown = ({ label, items }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="cursor-pointer text-[#555555] text-sm sm:text-base lg:text-lg font-semibold hover:text-black transition tracking-[-1px] flex items-center gap-1"
      >
        {label}
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isOpen && (
        <div className="absolute z-50 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
          <div className="py-1" role="menu" aria-orientation="vertical">
            {items.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                role="menuitem"
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default function Main() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hoveredSidebarItem, setHoveredSidebarItem] = useState(null);

  return (
    <>
      <Home/>
      {/* Hero Section */}
      <section className="w-full min-h-screen flex flex-col relative pt-16">
        {/* Gradient Box in Background */}
        <div className="flex text-center flex-col gap-4 items-center justify-center absolute w-[95vw] h-[85vh] bg-gradient-to-b from-[#4E8CFF] to-[#0C60FB] rounded-2xl shadow-xl z-0 left-1/2 transform -translate-x-1/2 mb-[-50px] overflow-hidden" >
          

            <img src="Headline.png" className="w-[800px] h-auto z-10" />

            <h3 className="font-semibold text-white leading-[22px] text-xl max-w-[550px] z-10">
              Education drives progress. Eduvance helps you learn, revise, and stay ahead in your academic journey
            </h3>

            {/* Discord Button */}
            <a
              href="https://discord.gg/eduvance"
              target="_blank"
              rel="noopener noreferrer"
              className="z-20"
            >
              <button className="cursor-pointer bg-white hover:bg-[#143166] text-[#428CF9] border-5 border-[#639afe] px-9 py-4 rounded-[16px] text-xl poppins-semibold shadow-lg flex items-center gap-5">
                <img src="/discordLogo.png" alt="Discord" className="w-9 h-auto" />
                Join our Discord Server
              </button>
            </a>
            {/* Decorative Images (Positioned with absolute so they don't mess layout) */}
            <img
              src="bgCrypto.png"
              alt="Decorative Crypto"
              className="absolute left-1/2 transform -translate-x-1/2 w-full h-auto z-10"
            />
            <img
              src="DocWidgets.png"
              alt=" "
              className="absolute top-[70%] sm:top-[90%] w-[300px] sm:w-[300px] h-auto transform sm:-translate-y-40 translate-y-10 left-[-20px] z-0"
            />

          
        </div>
      </section>

      {/* Scrolling Papers Section */}
      <section className="w-full overflow-hidden py-16 relative top-[-80px]">
        <div className="overflow-hidden h-[800px] w-full flex justify-center relative"> {/* Added 'relative' here */}
          {/* Top Blur Overlay */}
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-white to-transparent z-10"></div> {/* Adjust 'from-white' to your background color if needed */}

          <div className="flex flex-row gap-x-8 md:gap-x-16">
            <ScrollingColumn direction="scroll-up" />
            <ScrollingColumn direction="scroll-down" />
            <ScrollingColumn direction="scroll-up" />
            <ScrollingColumn direction="scroll-down" />
            <ScrollingColumn direction="scroll-up" />
            <ScrollingColumn direction="scroll-down" />
          </div>

          {/* Bottom Blur Overlay */}
          <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-white to-transparent z-10"></div> {/* Adjust 'from-white' to your background color if needed */}
        </div>
      </section>

      {/* Study Materials Section */}
      <section className="w-full py-24 relative top-[-500px]">
        <div className="relative flex items-center justify-center text-center top-[-200px]">
          {/* Blurred Background */}
          <div className="w-[350px] h-[250px]  sm:w-[700px] sm:h-[500px] rounded-full bg-white blur-2xl opacity-100 absolute" />

          {/* Heading + Button */}
          <div className="relative flex flex-col z-10 max-w-xl mx-auto justify-center items-center">
            <h1
              className="text-2xl w-[250px] sm:text-4xl font-semibold tracking-[-0.05em] text-black text-center"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              Study Materials to level up your revision
            </h1>

            <h3 className="mt-4 font-[600] text-[#878787] tracking-[-0.5px] text-m sm:text-xl text-center w-[250px] leading-tight sm:w-[550px]" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Find revision resources for your Exam Board and Subject
            </h3>

            <Link href="/resources" className="inline-block mt-6">
              <button className="cursor-pointer bg-[#2D74F8] hover:bg-[#143166] text-[#FFFFFF] px-6 py-2 rounded-[50px] text-xl poppins-semibold shadow-lg flex items-center gap-2">
                Explore Resources
                <img src="/ArrowR.png" alt="Arrow Right" className="w-6 h-auto" />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="w-full py-24 relative -mt-[600px]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div
              className="inline-block px-6 py-0.6 border-2 border-[#4B89FD] rounded-full text-black font-semibold tracking-[-0.7px] text-lg mb-8"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              Trusted by +17,000 Students worldwide
            </div>

            <img
              src="QuotationMarks.png"
              className="hidden sm:block w-[1200px] h-auto mx-auto absolute left-1/2 transform -translate-x-1/2 -translate-y-0 z-0"
            />

            <h1
              className="font-semibold text-3xl tracking-tighter sm:text-5xl sm:tracking-[-3px] sm:max-w-[550px] max-w-[350px] mx-auto z-20"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              Complete Academic Support Ecosystem
            </h1>

            <h3
              className="font-medium text-[21px] tracking-[-0.7px] leading-[20px] max-w-[520px] mx-auto mt-8"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              Connect instantly with like-minded learners. Ask questions, share resources, and stay motivated — all in one place
            </h3>


            <a
              href="https://discord.gg/Eduvance"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-15 "
            >
              <button
                className="cursor-pointer bg-[#3F82FD] hover:bg-[#143166] text-white border-5 border-[#B1CCFF] border-opacity-50 px-9 py-3 rounded-full text-xl poppins-semibold flex items-center gap-5"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                <img src="/WhiteDiscordLogo.png" alt="Discord" className="w-9 h-auto" />
                Join the community
              </button>
            </a>
          </div>

          <div className="relative">
            <div className="flex flex-col lg:flex-row gap-[-100px] items-stretch justify-center mt-24">
              <TestimonialCard
                content="Partnering with 00Pixel completely transformed our online presence. They didn't just deliver a beautiful website—they created a high-performance platform that drives real results. Within three months, our conversions increased by 35%, and the site is optimised to keep that momentum going. If you're looking for a team that combines design with strategy, 00Pixel is the way to go!"
                icon="/icon1.png"
                headline="Headline 1"
                rotation="rotate-[-2deg]"
              />

              <TestimonialCard
                content="We were struggling to find a web partner who understood our vision—until we found 00Pixel. They built a website that not only looks amazing but is also designed to attract and convert. Since launching, our client inquiries have doubled, and we're seeing a clear return on investment. Their ability to balance creativity with business goals is rare and invaluable!"
                icon="/icon2.png"
                headline="Headline 2"
                rotation="rotate-[1deg]"
              />

              <TestimonialCard
                content="Our website was outdated and failing to generate leads—00Pixel changed everything. From the start, they focused on creating a user-friendly experience while ensuring the backend was optimised for growth. We've seen a 40% increase in lead generation and a more seamless process for our customers. If you want a team that's as invested in your success as you are, 00Pixel is it!"
                icon="/icon3.png"
                headline="Headline 3"
                rotation="rotate-[-1.5deg]"
              />
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer Section */}
      <footer className="w-full bg-[#357BFD] pt-24 pb-8">
        <div className="container mx-auto px-4 relative">
          <img src="EduvanceFooter.png" className="h-auto w-[1900px] mx-auto transform -translate-y-5" />

          <div className="rounded-2xl p-6 max-w-[1850px] mx-auto h-[920px] sm:h-[920px] lg:h-[520px] bg-gradient-to-b from-[#FFFFFF] via-[#FAFCFF] to-[#357BFD] flex flex-col lg:flex-row gap-8 shadow-[0px_-10px_30px_#357BFD40] translate-y-[-40px]">
            {/* Left Column */}
            <div className="w-full lg:w-1/3 flex flex-col items-start mt-[6px]">
              <img src="BiggerLogo.png" className="w-auto h-15 object-contain mb-4" />
              <p className="text-[#757575] text-base leading-5 tracking-tight font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>
                A growing student-led community built for learners across AS, A Levels, AP, and undergrad programs. From revision and learning resources to solving your doubts, we're here to make education easier, smarter, and more connected
              </p>
            </div>

            {/* Right Column - 3 Inner Columns */}
            <div className="w-full lg:w-2/3 grid grid-cols-1 sm:grid-cols-3 gap-1 mt-[20px]">
              {/* Column 1 */}
              <div className="flex flex-col">
                <h3 className="text-black tracking-[-0.6px] text-lg font-[550] mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>Navigation</h3>
                <a href="#" className="text-[#757575] tracking-[-0.5px] font-medium hover:text-slate-950" style={{ fontFamily: 'Poppins, sans-serif' }}>Home</a>
                <a href="#" className="text-[#757575] tracking-[-0.5px] font-medium hover:text-slate-950" style={{ fontFamily: 'Poppins, sans-serif' }}>Resources</a>
                <a href="#" className="text-[#757575] tracking-[-0.5px] font-medium hover:text-slate-950" style={{ fontFamily: 'Poppins, sans-serif' }}>Past Papers</a>
                <a href="#" className="text-[#757575] tracking-[-0.5px] font-medium hover:text-slate-950" style={{ fontFamily: 'Poppins, sans-serif' }}>Match with a Tutor</a>
                <Link href='/staffAccess' className="text-[#757575] tracking-[-0.5px] font-medium hover:text-slate-950" style={{ fontFamily: 'Poppins, sans-serif' }}> Staff Page</Link>
                <a href="#" className="text-[#757575] tracking-[-0.5px] font-medium hover:text-slate-950" style={{ fontFamily: 'Poppins, sans-serif' }}>About</a>
                <a href="#" className="text-[#757575] tracking-[-0.5px] font-medium hover:text-slate-950" style={{ fontFamily: 'Poppins, sans-serif' }}>Community</a>
              </div>

              {/* Column 2 */}
              <div className="flex flex-col">
                <h3 className="text-black tracking-[-0.6px] text-lg font-[550] mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>Legal Info</h3>
                <a href="#" className="text-[#757575] tracking-[-0.5px] font-medium hover:text-slate-950" style={{ fontFamily: 'Poppins, sans-serif' }}>Community Guidelines</a>
                <a href="#" className="text-[#757575] tracking-[-0.5px] font-medium hover:text-slate-950" style={{ fontFamily: 'Poppins, sans-serif' }}>Terms of Services</a>
                <a href="#" className="text-[#757575] tracking-[-0.5px] font-medium hover:text-slate-950" style={{ fontFamily: 'Poppins, sans-serif' }}>Privacy Policy</a>
              </div>

              {/* Column 3 */}
              <div className="flex flex-col">
                <a href="#" className="text-black tracking-[-0.6px] text-lg font-[550] mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>Join the Community</a>
                <a href="" className="text-[#757575] tracking-[-0.5px] font-medium hover:text-slate-950" style={{ fontFamily: 'Poppins, sans-serif' }}>Join the Discord Server</a>
                <a href="/contributor" className="text-[#757575] tracking-[-0.5px] font-medium hover:text-slate-950" style={{ fontFamily: 'Poppins, sans-serif' }}>Become a community contributor</a>
                <a href="#" className="text-[#757575] tracking-[-0.5px] font-medium hover:text-slate-950" style={{ fontFamily: 'Poppins, sans-serif' }}>Become a tutor</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

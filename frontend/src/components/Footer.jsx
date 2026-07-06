const Footer = () => (
  <footer className="border-t border-white/10 bg-[#0F172A]/80 backdrop-blur-xl py-6 px-6">
    <div className="container flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500">
      <p>© 2026 <span className="text-purple-400 font-semibold">Eventora</span>. All rights reserved.</p>
      <div className="flex gap-6">
        {["Privacy", "Terms", "Support"].map(link => (
          <a key={link} href="#" className="hover:text-purple-400 transition-colors duration-200">{link}</a>
        ))}
      </div>
    </div>
  </footer>
);

export default Footer;

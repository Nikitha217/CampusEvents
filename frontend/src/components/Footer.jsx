const Footer = () => (
  <footer className="border-t border-border bg-card py-6 px-6">
    <div className="container flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
      <p>© 2026 Eventora. All rights reserved.</p>
      <div className="flex gap-6">
        <a href="#" className="hover:text-primary transition-colors">Privacy</a>
        <a href="#" className="hover:text-primary transition-colors">Terms</a>
        <a href="#" className="hover:text-primary transition-colors">Support</a>
      </div>
    </div>
  </footer>
);

export default Footer;

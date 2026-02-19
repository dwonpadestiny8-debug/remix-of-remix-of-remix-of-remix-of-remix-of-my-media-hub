import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t border-border mt-12 py-8">
      <div className="max-w-[1400px] mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <span className="text-lg font-black text-gradient-green">DWON PA DESTINY</span>
            <div className="flex gap-4 text-xs text-muted-foreground">
              <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
              <Link to="/browse" className="hover:text-foreground transition-colors">Browse</Link>
              <span>About</span>
              <span>Help</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            © 2026 DWON PA DESTINY. All rights reserved.
          </p>
        </div>
        <div className="mt-4 p-3 rounded-lg bg-secondary text-center">
          <p className="text-xs text-muted-foreground">
            Enjoy the Best Experience on the <span className="text-primary font-semibold">DWON PA DESTINY</span> App
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

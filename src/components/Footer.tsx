import { Link } from "react-router-dom";
import { FileText, Shield, AlertTriangle } from "lucide-react";

const Footer = () => {
  return (
    <footer className="w-full border-t bg-background">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <p className="text-lg font-medium">
          © 2025 Pixivloader. All rights reserved.
        </p>
        
        <div className="flex items-center gap-8">
          <Link
            to="/terms"
            className="flex items-center gap-2 text-lg font-medium hover:text-primary transition-colors group"
          >
            <FileText className="w-5 h-5 text-blue-500 group-hover:text-primary" />
            Terms of Service
          </Link>
          <Link
            to="/privacy"
            className="flex items-center gap-2 text-lg font-medium hover:text-primary transition-colors group"
          >
            <Shield className="w-5 h-5 text-green-500 group-hover:text-primary" />
            Privacy Policy
          </Link>
          <Link
            to="/disclaimer"
            className="flex items-center gap-2 text-lg font-medium hover:text-primary transition-colors group"
          >
            <AlertTriangle className="w-5 h-5 text-yellow-500 group-hover:text-primary" />
            Disclaimer
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

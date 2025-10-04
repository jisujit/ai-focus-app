import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, BookOpen, Users, Phone, Info, Home, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import RegistrationStatusChecker from "@/components/RegistrationStatusChecker";
import GlobalSearch from "@/components/GlobalSearch";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Services", href: "/services", icon: BookOpen },
    { name: "About", href: "/about", icon: Users },
    { name: "Contact", href: "/contact", icon: Phone },
  ];

  // Navigation component - fixed imports and removed undefined functions - cache cleared

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav 
      id="navigation"
      className="bg-white/98 backdrop-blur-xl shadow-strong sticky top-0 z-50 border-b border-accent/20"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-18">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center shadow-strong group-hover:shadow-glow group-hover:scale-105 transition-all duration-300">
              <BookOpen className="w-7 h-7 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-foreground group-hover:text-accent transition-colors duration-300">AI Focus</span>
              <span className="text-sm text-accent font-medium -mt-1">Academy</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center space-x-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 relative group",
                  isActive(item.href)
                    ? "text-white bg-gradient-primary shadow-strong scale-105"
                    : "text-muted-foreground hover:text-accent hover:bg-accent/10 hover:scale-105"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
                {isActive(item.href) && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full"></div>
                )}
              </Link>
            ))}
            <GlobalSearch />
            <RegistrationStatusChecker />
            <Button 
              variant="professional" 
              size="sm" 
              className="ml-4 px-6 py-3 rounded-xl font-semibold shadow-strong hover:shadow-glow hover:scale-105 transition-all duration-300"
              onClick={() => navigate('/services')}
            >
              Browse Services
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-navigation"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div 
            id="mobile-navigation"
            className="md:hidden py-6 space-y-3 border-t border-accent/20 bg-gradient-to-b from-white to-accent/5"
            role="navigation"
            aria-label="Mobile navigation menu"
          >
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center space-x-3 px-4 py-4 rounded-xl text-sm font-semibold transition-all duration-300",
                  isActive(item.href)
                    ? "text-white bg-gradient-primary shadow-strong"
                    : "text-muted-foreground hover:text-accent hover:bg-accent/10"
                )}
                onClick={() => setIsMenuOpen(false)}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            ))}
            <div className="pt-6 border-t border-accent/20 space-y-4">
              <GlobalSearch />
              <RegistrationStatusChecker />
              <Button 
                variant="professional" 
                className="w-full py-4 rounded-xl font-semibold shadow-strong"
                onClick={() => navigate('/services')}
              >
                Browse Services
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  X, 
  BookOpen, 
  Users, 
  Phone, 
  Info, 
  Home,
  Zap,
  ArrowRight,
  Clock,
  Star
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: 'page' | 'service' | 'feature';
  url: string;
  icon: React.ComponentType<any>;
  category?: string;
}

const GlobalSearch: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Mock search results - in a real app, this would come from an API
  const searchData: SearchResult[] = [
    {
      id: 'home',
      title: 'Home',
      description: 'AI Focus Academy homepage',
      type: 'page',
      url: '/',
      icon: Home,
      category: 'Pages'
    },
    {
      id: 'services',
      title: 'Services',
      description: 'Professional AI training services and programs',
      type: 'page',
      url: '/services',
      icon: BookOpen,
      category: 'Pages'
    },
    {
      id: 'about',
      title: 'About',
      description: 'Learn about AI Focus Academy and our mission',
      type: 'page',
      url: '/about',
      icon: Info,
      category: 'Pages'
    },
    {
      id: 'contact',
      title: 'Contact',
      description: 'Get in touch with our team',
      type: 'page',
      url: '/contact',
      icon: Phone,
      category: 'Pages'
    },
    {
      id: 'ai-fundamentals',
      title: 'AI Fundamentals & ChatGPT Mastery',
      description: 'Comprehensive introduction to AI and ChatGPT applications',
      type: 'service',
      url: '/services#ai-fundamentals',
      icon: BookOpen,
      category: 'Training Services'
    },
    {
      id: 'machine-learning',
      title: 'Machine Learning Training',
      description: 'Hands-on ML and GenAI training programs',
      type: 'service',
      url: '/services#machine-learning',
      icon: BookOpen,
      category: 'Training Services'
    },
    {
      id: 'automation',
      title: 'Automation & DevOps',
      description: 'Master infrastructure automation and CI/CD pipelines',
      type: 'service',
      url: '/services#automation',
      icon: BookOpen,
      category: 'Training Services'
    },
    {
      id: 'corporate-training',
      title: 'Corporate Training',
      description: 'Customized training programs for organizations',
      type: 'service',
      url: '/services#corporate-training',
      icon: Users,
      category: 'Training Services'
    }
  ];

  // Handle search
  useEffect(() => {
    if (searchQuery.length < 2) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    
    // Simulate search delay for better UX
    const timeoutId = setTimeout(() => {
      const filtered = searchData.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      setResults(filtered.slice(0, 8)); // Limit to 8 results
      setIsSearching(false);
    }, 150);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery("");
        setResults([]);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        setIsOpen(true);
        setTimeout(() => inputRef.current?.focus(), 100);
      }
      if (event.key === 'Escape') {
        setIsOpen(false);
        setSearchQuery("");
        setResults([]);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleResultClick = (result: SearchResult) => {
    navigate(result.url);
    setIsOpen(false);
    setSearchQuery("");
    setResults([]);
  };

  const getResultIcon = (result: SearchResult) => {
    const IconComponent = result.icon;
    return <IconComponent className="w-4 h-4" />;
  };

  const getResultColor = (type: string) => {
    switch (type) {
      case 'page': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'service': return 'text-green-600 bg-green-50 border-green-200';
      case 'feature': return 'text-purple-600 bg-purple-50 border-purple-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="ml-2 relative"
      >
        <Search className="w-4 h-4 mr-2" />
        Search
        <kbd className="ml-2 px-1.5 py-0.5 text-xs bg-muted rounded">⌘K</kbd>
      </Button>
    );
  }

  return (
    <div ref={searchRef} className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm">
      <div className="flex items-start justify-center pt-20 px-4">
        <div className="w-full max-w-2xl">
          <Card className="border-2 border-accent/20 shadow-strong animate-in slide-in-from-top-2 duration-300">
            <CardContent className="p-0">
              {/* Search Input */}
              <div className="flex items-center p-4 border-b border-border/50">
                <Search className="w-5 h-5 text-muted-foreground mr-3" />
                <Input
                  ref={inputRef}
                  type="text"
                  placeholder="Search pages, services, or features..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border-0 focus-visible:ring-0 text-lg"
                  autoFocus
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsOpen(false);
                    setSearchQuery("");
                    setResults([]);
                  }}
                  className="ml-2 h-8 w-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Search Results */}
              <div className="max-h-96 overflow-y-auto">
                {searchQuery.length < 2 ? (
                  <div className="p-6 text-center text-muted-foreground">
                    <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>Type at least 2 characters to search</p>
                    <div className="mt-4 flex items-center justify-center space-x-4 text-sm">
                      <div className="flex items-center">
                        <kbd className="px-2 py-1 bg-muted rounded text-xs">⌘K</kbd>
                        <span className="ml-2">to open search</span>
                      </div>
                      <div className="flex items-center">
                        <kbd className="px-2 py-1 bg-muted rounded text-xs">Esc</kbd>
                        <span className="ml-2">to close</span>
                      </div>
                    </div>
                  </div>
                ) : isSearching ? (
                  <div className="p-6 text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent mx-auto mb-2"></div>
                    <p className="text-muted-foreground">Searching...</p>
                  </div>
                ) : results.length === 0 ? (
                  <div className="p-6 text-center text-muted-foreground">
                    <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No results found for "{searchQuery}"</p>
                    <p className="text-sm mt-1">Try different keywords</p>
                  </div>
                ) : (
                  <div className="p-2">
                    {results.map((result, index) => (
                      <Button
                        key={result.id}
                        variant="ghost"
                        onClick={() => handleResultClick(result)}
                        className="w-full justify-start p-3 h-auto hover:bg-accent/5"
                      >
                        <div className="flex items-start space-x-3 w-full">
                          <div className={cn(
                            "p-2 rounded-lg border",
                            getResultColor(result.type)
                          )}>
                            {getResultIcon(result)}
                          </div>
                          <div className="flex-1 text-left">
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="font-medium text-foreground">{result.title}</h4>
                              <Badge variant="outline" className="text-xs">
                                {result.category}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{result.description}</p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </Button>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-3 border-t border-border/50 bg-muted/20">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <kbd className="px-1.5 py-0.5 bg-muted rounded">↑↓</kbd>
                      <span className="ml-1">to navigate</span>
                    </div>
                    <div className="flex items-center">
                      <kbd className="px-1.5 py-0.5 bg-muted rounded">Enter</kbd>
                      <span className="ml-1">to select</span>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Zap className="w-3 h-3 mr-1" />
                    <span>Global Search</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default GlobalSearch;

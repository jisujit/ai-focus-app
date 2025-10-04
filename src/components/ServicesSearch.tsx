import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Search, 
  Filter, 
  X, 
  Calendar, 
  Users, 
  Clock, 
  Star,
  ChevronDown,
  CheckCircle,
  AlertCircle,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Service {
  id: string;
  title: string;
  description: string;
  duration: string;
  level: string;
  format: string;
  status: string;
  allow_registration: boolean;
  features: string[];
  created_at: string;
}

interface ServicesSearchProps {
  services: Service[];
  onFilteredServices: (services: Service[]) => void;
}

const ServicesSearch: React.FC<ServicesSearchProps> = ({ services, onFilteredServices }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState({
    status: [] as string[],
    level: [] as string[],
    format: [] as string[],
    duration: [] as string[]
  });
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Get unique filter options
  const filterOptions = useMemo(() => {
    const statuses = [...new Set(services.map(s => s.status))];
    const levels = [...new Set(services.map(s => s.level))];
    const formats = [...new Set(services.map(s => s.format))];
    const durations = [...new Set(services.map(s => s.duration))];
    
    return { statuses, levels, formats, durations };
  }, [services]);

  // Filter services based on search and filters
  const filteredServices = useMemo(() => {
    return services.filter(service => {
      // Text search
      const searchMatch = !searchQuery || 
        service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.features.some(feature => 
          feature.toLowerCase().includes(searchQuery.toLowerCase())
        );

      // Filter matches
      const statusMatch = selectedFilters.status.length === 0 || 
        selectedFilters.status.includes(service.status);
      
      const levelMatch = selectedFilters.level.length === 0 || 
        selectedFilters.level.includes(service.level);
      
      const formatMatch = selectedFilters.format.length === 0 || 
        selectedFilters.format.includes(service.format);
      
      const durationMatch = selectedFilters.duration.length === 0 || 
        selectedFilters.duration.includes(service.duration);

      return searchMatch && statusMatch && levelMatch && formatMatch && durationMatch;
    });
  }, [services, searchQuery, selectedFilters]);

  // Update parent component when filtered services change
  useEffect(() => {
    onFilteredServices(filteredServices);
  }, [filteredServices, onFilteredServices]);

  const toggleFilter = (category: keyof typeof selectedFilters, value: string) => {
    setSelectedFilters(prev => ({
      ...prev,
      [category]: prev[category].includes(value)
        ? prev[category].filter(item => item !== value)
        : [...prev[category], value]
    }));
  };

  const clearAllFilters = () => {
    setSelectedFilters({
      status: [],
      level: [],
      format: [],
      duration: []
    });
    setSearchQuery("");
  };

  const getActiveFiltersCount = () => {
    return Object.values(selectedFilters).flat().length + (searchQuery ? 1 : 0);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'coming_soon': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-50 border-green-200';
      case 'coming_soon': return 'text-orange-600 bg-orange-50 border-orange-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Active';
      case 'coming_soon': return 'Coming Soon';
      case 'draft': return 'Draft';
      case 'archived': return 'Archived';
      default: return status;
    }
  };

  return (
    <div className="sticky top-20 z-40 bg-white/95 backdrop-blur-md border-b border-border/50 py-4" role="search" aria-label="Search and filter training services">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Search Bar */}
        <div className="relative">
          <div className="flex items-center space-x-3 mb-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" aria-hidden="true" />
              <Input
                type="text"
                placeholder="Search services, features, or keywords..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(e.target.value.length > 0);
                }}
                onFocus={() => setShowSuggestions(searchQuery.length > 0)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                className="pl-10 pr-4 py-2 text-base border-2 border-border/50 focus:border-accent transition-all duration-300 rounded-lg shadow-soft hover:shadow-medium"
                aria-label="Search training services"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
            
            <Button
              variant="outline"
              onClick={() => setIsFiltersOpen(!isFiltersOpen)}
              className={cn(
                "px-4 py-2 border-2 transition-all duration-300 rounded-lg",
                isFiltersOpen 
                  ? "border-accent bg-accent/5 text-accent" 
                  : "border-border/50 hover:border-accent/50"
              )}
              aria-label={`${isFiltersOpen ? 'Close' : 'Open'} filter options`}
              aria-expanded={isFiltersOpen}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
              {getActiveFiltersCount() > 0 && (
                <Badge variant="secondary" className="ml-2 bg-accent text-accent-foreground text-xs" aria-label={`${getActiveFiltersCount()} active filters`}>
                  {getActiveFiltersCount()}
                </Badge>
              )}
            </Button>
          </div>

          {/* Quick Stats - Only show when user has searched or filtered */}
          {(searchQuery || getActiveFiltersCount() > 0) && (
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
              <div className="flex items-center space-x-3">
                <span className="flex items-center">
                  <Zap className="w-4 h-4 mr-1 text-accent" />
                  {filteredServices.length} service{filteredServices.length !== 1 ? 's' : ''} found
                </span>
                {getActiveFiltersCount() > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="text-accent hover:text-accent/80 text-xs"
                  >
                    Clear all filters
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Advanced Filters Panel */}
        {isFiltersOpen && (
          <Card className="border-2 border-accent/20 shadow-strong animate-in slide-in-from-top-2 duration-300">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Status Filter */}
                <div>
                  <h4 className="font-semibold text-foreground mb-2 flex items-center text-sm">
                    <CheckCircle className="w-4 h-4 mr-2 text-accent" />
                    Status
                  </h4>
                  <div className="space-y-1">
                    {filterOptions.statuses.map(status => (
                      <Button
                        key={status}
                        variant={selectedFilters.status.includes(status) ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleFilter('status', status)}
                        className={cn(
                          "w-full justify-start text-sm",
                          selectedFilters.status.includes(status) && getStatusColor(status)
                        )}
                      >
                        {getStatusIcon(status)}
                        <span className="ml-2">{getStatusLabel(status)}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Level Filter */}
                <div>
                  <h4 className="font-semibold text-foreground mb-2 flex items-center text-sm">
                    <Star className="w-4 h-4 mr-2 text-accent" />
                    Level
                  </h4>
                  <div className="space-y-1">
                    {filterOptions.levels.map(level => (
                      <Button
                        key={level}
                        variant={selectedFilters.level.includes(level) ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleFilter('level', level)}
                        className="w-full justify-start text-sm"
                      >
                        <span className="capitalize">{level}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Format Filter */}
                <div>
                  <h4 className="font-semibold text-foreground mb-2 flex items-center text-sm">
                    <Users className="w-4 h-4 mr-2 text-accent" />
                    Format
                  </h4>
                  <div className="space-y-1">
                    {filterOptions.formats.map(format => (
                      <Button
                        key={format}
                        variant={selectedFilters.format.includes(format) ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleFilter('format', format)}
                        className="w-full justify-start text-sm"
                      >
                        <span className="capitalize">{format}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Duration Filter */}
                <div>
                  <h4 className="font-semibold text-foreground mb-2 flex items-center text-sm">
                    <Clock className="w-4 h-4 mr-2 text-accent" />
                    Duration
                  </h4>
                  <div className="space-y-1">
                    {filterOptions.durations.map(duration => (
                      <Button
                        key={duration}
                        variant={selectedFilters.duration.includes(duration) ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleFilter('duration', duration)}
                        className="w-full justify-start text-sm"
                      >
                        <span>{duration}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Active Filters Display */}
        {getActiveFiltersCount() > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {searchQuery && (
              <Badge variant="secondary" className="px-3 py-1">
                <Search className="w-3 h-3 mr-1" />
                "{searchQuery}"
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchQuery("")}
                  className="ml-2 h-4 w-4 p-0 hover:bg-transparent"
                >
                  <X className="w-3 h-3" />
                </Button>
              </Badge>
            )}
            
            {selectedFilters.status.map(status => (
              <Badge key={status} variant="secondary" className="px-3 py-1">
                {getStatusIcon(status)}
                <span className="ml-1">{getStatusLabel(status)}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleFilter('status', status)}
                  className="ml-2 h-4 w-4 p-0 hover:bg-transparent"
                >
                  <X className="w-3 h-3" />
                </Button>
              </Badge>
            ))}
            
            {selectedFilters.level.map(level => (
              <Badge key={level} variant="secondary" className="px-3 py-1">
                <span className="capitalize">{level}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleFilter('level', level)}
                  className="ml-2 h-4 w-4 p-0 hover:bg-transparent"
                >
                  <X className="w-3 h-3" />
                </Button>
              </Badge>
            ))}
            
            {selectedFilters.format.map(format => (
              <Badge key={format} variant="secondary" className="px-3 py-1">
                <span className="capitalize">{format}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleFilter('format', format)}
                  className="ml-2 h-4 w-4 p-0 hover:bg-transparent"
                >
                  <X className="w-3 h-3" />
                </Button>
              </Badge>
            ))}
            
            {selectedFilters.duration.map(duration => (
              <Badge key={duration} variant="secondary" className="px-3 py-1">
                <span>{duration}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleFilter('duration', duration)}
                  className="ml-2 h-4 w-4 p-0 hover:bg-transparent"
                >
                  <X className="w-3 h-3" />
                </Button>
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ServicesSearch;

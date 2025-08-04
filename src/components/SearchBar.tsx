import { Search, MapPin, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  location: string;
  onLocationChange: (location: string) => void;
  onFilterClick: () => void;
  activeFilters: string[];
}

const SearchBar = ({ 
  searchQuery, 
  onSearchChange, 
  location, 
  onLocationChange, 
  onFilterClick,
  activeFilters 
}: SearchBarProps) => {
  return (
    <div className="bg-card border border-border rounded-lg p-4 shadow-card">
      <div className="space-y-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search for services..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 bg-background border-input focus:border-primary"
          />
        </div>
        
        {/* Location and Filter Row */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Location (e.g., Nairobi, Mombasa, Kisumu)"
              value={location}
              onChange={(e) => onLocationChange(e.target.value)}
              className="pl-10 bg-background border-input focus:border-primary"
            />
          </div>
          
          <Button 
            variant="outline" 
            onClick={onFilterClick}
            className="flex items-center gap-2 px-4"
          >
            <Filter className="w-4 h-4" />
            Filter
            {activeFilters.length > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs">
                {activeFilters.length}
              </Badge>
            )}
          </Button>
        </div>
        
        {/* Active Filters */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {activeFilters.map((filter, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {filter}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
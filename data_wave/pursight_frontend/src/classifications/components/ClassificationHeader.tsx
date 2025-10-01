import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Search, Filter, Bell, Settings, Menu, X, RefreshCw, 
  ChevronDown, User, LogOut, Shield, AlertTriangle 
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ClassificationHeaderProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchResults: any;
  onClearSearch: () => void;
  notifications: any[];
  onOpenNotifications: () => void;
  onOpenSettings: () => void;
  onOpenCommandPalette: () => void;
  onRefreshData: () => void;
  isLoading: boolean;
  user: {
    name?: string;
    email?: string;
    avatar?: string;
    role?: string;
  };
  onLogout: () => void;
}

const ClassificationHeader: React.FC<ClassificationHeaderProps> = ({
  sidebarOpen,
  onToggleSidebar,
  searchQuery,
  onSearchChange,
  searchResults,
  onClearSearch,
  notifications,
  onOpenNotifications,
  onOpenSettings,
  onOpenCommandPalette,
  onRefreshData,
  isLoading,
  user,
  onLogout
}) => {
  const [searchFocused, setSearchFocused] = useState(false);
  
  const unreadCount = notifications?.filter(n => !n.read).length || 0;

  const handleSearchResultClick = useCallback((result: any) => {
    // Handle search result navigation
    console.log('Navigate to:', result);
    onClearSearch();
  }, [onClearSearch]);

  return (
    <header className="sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Left side */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleSidebar}
            className="lg:hidden"
          >
            <Menu className="h-4 w-4" />
          </Button>
          
          {/* Breadcrumbs */}
          <nav className="hidden md:flex items-center space-x-2 text-sm">
            <span className="text-muted-foreground">Classifications</span>
            <ChevronDown className="h-3 w-3 text-muted-foreground rotate-[-90deg]" />
            <span className="font-medium">Dashboard</span>
          </nav>
        </div>

        {/* Center - Search */}
        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search classifications, models, workflows..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
              className="pl-10 pr-16"
            />
            
            {/* Search Results Dropdown */}
            {searchResults && searchQuery && searchFocused && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-lg shadow-lg z-50 max-h-96 overflow-hidden">
                <ScrollArea className="max-h-96">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-muted-foreground">
                        {searchResults.totalResults} results for "{searchResults.query}"
                      </span>
                      <Button variant="ghost" size="sm" onClick={onClearSearch}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {/* Search Categories */}
                    {Object.entries(searchResults.categories || {}).map(([category, results]) => {
                      if (!Array.isArray(results) || results.length === 0) return null;
                      
                      return (
                        <div key={category} className="mb-4">
                          <h4 className="text-sm font-medium mb-2 capitalize">{category}</h4>
                          <div className="space-y-1">
                            {results.slice(0, 3).map((result: any, index: number) => (
                              <div
                                key={index}
                                className="p-2 hover:bg-muted rounded cursor-pointer"
                                onClick={() => handleSearchResultClick(result)}
                              >
                                <div className="font-medium text-sm">{result.name}</div>
                                <div className="text-xs text-muted-foreground">{result.description}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-2">
          {/* Refresh Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefreshData}
            disabled={isLoading}
            className="hidden sm:flex"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>

          {/* Command Palette */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenCommandPalette}
            className="hidden sm:flex"
          >
            <Search className="h-4 w-4" />
          </Button>

          {/* Notifications */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenNotifications}
            className="relative"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 text-xs p-0 flex items-center justify-center"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </Badge>
            )}
          </Button>

          {/* Settings */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenSettings}
          >
            <Settings className="h-4 w-4" />
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatar} alt={user?.name || 'User'} />
                  <AvatarFallback>
                    {user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.name || 'User'}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user?.email || 'user@example.com'}</p>
                  <Badge variant="outline" className="w-fit mt-1">
                    {user?.role || 'User'}
                  </Badge>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onOpenSettings}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default ClassificationHeader;

import { Bell, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import UserDropdown from "./UserDropdown";
import UnreadMessagesBadge from "./chat/UnreadMessagesBadge";

interface HeaderProps {
  onMenuClick: () => void;
  onNotificationClick: () => void;
  notificationCount: number;
  onNavigate: (page: 'provider-dashboard' | 'auth' | 'provider-registration' | 'chat' | 'my-bookings' | 'settings' | 'admin-dashboard') => void;
}

const Header = ({ 
  onMenuClick, 
  onNotificationClick, 
  notificationCount,
  onNavigate
}: HeaderProps) => {
  return (
    <header className="bg-card border-b border-border shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left: Menu and Logo */}
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onMenuClick}
              className="md:hidden"
            >
              <Menu className="w-5 h-5" />
            </Button>
            
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">T</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  TaskZetu
                </h1>
                <p className="text-xs text-muted-foreground -mt-1">
                  Local Services Marketplace
                </p>
              </div>
            </div>
          </div>
          
          {/* Center: Empty space for layout */}
          <div className="flex-1"></div>
          
          {/* Right: Chat, Notifications and Profile */}
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onNavigate('chat')}
              className="relative"
            >
              <UnreadMessagesBadge />
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onNotificationClick}
              className="relative"
            >
              <Bell className="w-5 h-5" />
              {notificationCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 w-5 h-5 text-xs flex items-center justify-center p-0"
                >
                  {notificationCount > 9 ? '9+' : notificationCount}
                </Badge>
              )}
            </Button>
            
            <UserDropdown onNavigate={onNavigate} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
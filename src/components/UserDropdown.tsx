import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { User, Settings, BookOpen, LogOut, UserPlus, Trash2, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UserDropdownProps {
  onNavigate: (page: 'provider-dashboard' | 'auth' | 'provider-registration' | 'my-bookings' | 'settings' | 'admin-dashboard') => void;
}

export default function UserDropdown({ onNavigate }: UserDropdownProps) {
  const { user, userRole, hasRole, signOut, deleteAccount } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { toast } = useToast();

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
  };

  const handleNavigation = (page: 'provider-dashboard' | 'auth' | 'provider-registration' | 'my-bookings' | 'settings' | 'admin-dashboard') => {
    onNavigate(page);
    setIsOpen(false);
  };

  const handleDeleteAccount = async () => {
    const { error } = await deleteAccount();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete account. Please try again.",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Account Deleted",
        description: "Your account has been permanently deleted.",
      });
      // Auth state change will automatically redirect to auth page
    }
    setShowDeleteDialog(false);
    setIsOpen(false);
  };

  return (
    <>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="relative">
            <User className="w-5 h-5" />
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent 
          align="end" 
          className="w-56 bg-background border border-border shadow-lg"
          sideOffset={8}
        >
          {user ? (
            <>
              <div className="px-3 py-2 border-b border-border">
                <p className="text-sm font-medium truncate">{user.email}</p>
                <p className="text-xs text-muted-foreground">
                  {userRole ? `${userRole.charAt(0).toUpperCase() + userRole.slice(1)}` : 'User'}
                </p>
              </div>
              
              <DropdownMenuItem 
                onClick={() => handleNavigation('provider-dashboard')}
                className="cursor-pointer"
              >
                <User className="mr-2 h-4 w-4" />
                Provider Dashboard
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                onClick={() => handleNavigation('provider-registration')}
                className="cursor-pointer"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Become a Provider
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                onClick={() => handleNavigation('my-bookings')}
                className="cursor-pointer"
              >
                <BookOpen className="mr-2 h-4 w-4" />
                My Bookings
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                onClick={() => handleNavigation('settings')}
                className="cursor-pointer"
              >
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              
              {hasRole('admin') && (
                <DropdownMenuItem 
                  onClick={() => handleNavigation('admin-dashboard')}
                  className="cursor-pointer"
                >
                  <Shield className="mr-2 h-4 w-4" />
                  Admin Dashboard
                </DropdownMenuItem>
              )}
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem 
                onClick={handleSignOut}
                className="cursor-pointer"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                onClick={() => setShowDeleteDialog(true)}
                className="cursor-pointer text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Account
              </DropdownMenuItem>
            </>
          ) : (
            <DropdownMenuItem 
              onClick={() => handleNavigation('auth')}
              className="cursor-pointer"
            >
              <User className="mr-2 h-4 w-4" />
              Sign In / Sign Up
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Account</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete your account? This action cannot be undone. 
              All your data, including provider profile, bookings, and messages will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteAccount}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
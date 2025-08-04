import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import SearchBar from "@/components/SearchBar";
import CategoryGrid from "@/components/CategoryGrid";
import EnhancedNotificationPanel from "@/components/EnhancedNotificationPanel";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Star, CheckCircle } from "lucide-react";

interface IndexProps {
  navigate: (page: 'home' | 'services' | 'provider-registration' | 'provider-dashboard' | 'auth' | 'chat' | 'my-bookings' | 'settings' | 'admin-dashboard', categoryId?: string, chatOptions?: any) => void;
}

const Index = ({ navigate }: IndexProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("Kenya");
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const { user, signOut } = useAuth();

  const handleCategoryClick = (categoryId: string) => {
    navigate('services', categoryId);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Header
        onMenuClick={() => console.log('Menu clicked')}
        onNotificationClick={() => setShowNotifications(true)}
        notificationCount={notificationCount}
        onNavigate={navigate}
      />

      <EnhancedNotificationPanel
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        notificationCount={notificationCount}
        onNotificationCountChange={setNotificationCount}
      />

      <main className="container mx-auto px-4 py-6 space-y-8">
        {/* Hero Section */}
        <section className="text-center py-8">
          <div className="flex justify-between items-center mb-8">
            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Welcome to <span className="bg-gradient-primary bg-clip-text text-transparent">TaskZetu</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
                Your local services marketplace. Connect with trusted service providers.
              </p>
            </div>
            <div className="flex gap-4">
              {user ? (
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">
                    Welcome, {user.email}
                  </span>
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('provider-dashboard')}
                  >
                    Dashboard
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('provider-registration')}
                  >
                    Become a Provider
                  </Button>
                  <Button variant="outline" onClick={handleSignOut}>
                    Sign Out
                  </Button>
                </div>
              ) : (
                <Button onClick={() => navigate('auth')}>
                  Sign In / Sign Up
                </Button>
              )}
            </div>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6 mb-8">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-success" />
                <span className="text-sm">Professional Service</span>
              </div>
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-warning" />
              <span className="text-sm">Top Rated</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-info" />
              <span className="text-sm">1000+ Services</span>
            </div>
          </div>

          <SearchBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            location={location}
            onLocationChange={setLocation}
            onFilterClick={() => console.log('Filter clicked')}
            activeFilters={[]}
          />
        </section>

        {/* Categories Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Popular Services</h2>
              <p className="text-muted-foreground">
                Browse by category to find exactly what you need
              </p>
            </div>
            <Button 
              variant="outline"
              onClick={() => navigate('services')}
            >
              View All
            </Button>
          </div>
          
          <CategoryGrid onCategoryClick={handleCategoryClick} />
        </section>

        {/* Stats Section */}
        <section className="py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="text-center">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-primary mb-2">1,200+</div>
                <div className="text-sm text-muted-foreground">Active Providers</div>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-secondary mb-2">15,000+</div>
                <div className="text-sm text-muted-foreground">Jobs Completed</div>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-success mb-2">4.8★</div>
                <div className="text-sm text-muted-foreground">Average Rating</div>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-warning mb-2">24/7</div>
                <div className="text-sm text-muted-foreground">Support</div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-8">
          <h2 className="text-2xl font-bold text-center mb-8">How TaskZetu Works</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-foreground">1</span>
              </div>
              <h3 className="font-semibold mb-2">Choose a Service</h3>
              <p className="text-sm text-muted-foreground">
                Browse categories or search for specific services you need
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-secondary-foreground">2</span>
              </div>
              <h3 className="font-semibold mb-2">Book a Provider</h3>
              <p className="text-sm text-muted-foreground">
                Select a provider and schedule your service
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-foreground">3</span>
              </div>
              <h3 className="font-semibold mb-2">Get It Done</h3>
              <p className="text-sm text-muted-foreground">
                Enjoy professional service and rate your experience
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center py-12">
          <Card className="bg-gradient-hero border-primary/20">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-4">
                Ready to get started?
              </h2>
              <p className="text-muted-foreground mb-6">
                Join thousands of satisfied customers who trust TaskZetu
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="text-lg px-8 py-6" onClick={() => navigate('services')}>
                  Find Services
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8 py-6" onClick={() => navigate('provider-registration')}>
                  Become a Provider
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
};

export default Index;
import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "@/pages/Index";
import Services from "@/pages/Services";
import ProviderRegistration from "@/pages/ProviderRegistration";
import ProviderDashboard from "@/pages/ProviderDashboard";
import Auth from "@/pages/Auth";
import ChatInterface from "@/components/chat/ChatInterface";
import MyBookings from "@/pages/MyBookings";
import Settings from "@/pages/Settings";
import AdminDashboard from "@/pages/AdminDashboard";

type Page = 'home' | 'services' | 'provider-registration' | 'provider-dashboard' | 'auth' | 'chat' | 'my-bookings' | 'settings' | 'admin-dashboard';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [chatData, setChatData] = useState<{
    userId: string;
    userEmail: string;
    userName?: string;
    bookingId?: string;
  } | undefined>();

  const navigate = (page: Page, categoryId?: string, chatOptions?: typeof chatData) => {
    setCurrentPage(page);
    if (categoryId) {
      setSelectedCategory(categoryId);
    }
    if (chatOptions) {
      setChatData(chatOptions);
    }
  };

  const goHome = () => {
    setCurrentPage('home');
    setSelectedCategory(undefined);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Index navigate={navigate} />;
      case 'services':
        return (
          <Services 
            categoryId={selectedCategory}
            onBack={goHome}
            onChat={(chatOptions) => navigate('chat', undefined, chatOptions)}
          />
        );
      case 'provider-registration':
        return <ProviderRegistration onBack={goHome} />;
      case 'provider-dashboard':
        return <ProviderDashboard onBack={goHome} />;
      case 'auth':
        return <Auth onBack={goHome} />;
      case 'chat':
        return <ChatInterface onBack={goHome} initialConversation={chatData} />;
      case 'my-bookings':
        return <MyBookings onBack={goHome} />;
      case 'settings':
        return <Settings onBack={goHome} />;
      case 'admin-dashboard':
        return <AdminDashboard onBack={goHome} />;
      default:
        return <Index navigate={navigate} />;
    }
  };

  return (
    <AuthProvider>
      {renderPage()}
      <Toaster />
    </AuthProvider>
  );
}

export default App;
import { useEffect, useState } from 'react';
import { 
  Wrench, Home, Car, Zap, Settings, Snowflake, 
  Paintbrush, Bug, Palette, Hammer, Monitor, 
  Trees, Truck, Smartphone, Shield, Wifi,
  PenTool, Camera, BookOpen, Heart, Scissors,
  Dumbbell, Hand, Music, Shirt, Package
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

interface Category {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  count: number;
}

const categories: Category[] = [
  { id: "plumbing", name: "Plumbing", icon: <Wrench className="w-6 h-6" />, color: "text-blue-600", count: 45 },
  { id: "cleaning", name: "House Cleaning", icon: <Home className="w-6 h-6" />, color: "text-green-600", count: 89 },
  { id: "carwash", name: "Car Wash", icon: <Car className="w-6 h-6" />, color: "text-purple-600", count: 23 },
  { id: "electrical", name: "Electricians", icon: <Zap className="w-6 h-6" />, color: "text-yellow-600", count: 67 },
  { id: "handyman", name: "Handyman", icon: <Settings className="w-6 h-6" />, color: "text-orange-600", count: 78 },
  { id: "appliance", name: "AC & Fridge Repair", icon: <Snowflake className="w-6 h-6" />, color: "text-cyan-600", count: 34 },
  { id: "painting", name: "Painting", icon: <Paintbrush className="w-6 h-6" />, color: "text-red-600", count: 56 },
  { id: "pest", name: "Pest Control", icon: <Bug className="w-6 h-6" />, color: "text-amber-600", count: 28 },
  { id: "interior", name: "Interior Design", icon: <Palette className="w-6 h-6" />, color: "text-pink-600", count: 41 },
  { id: "furniture", name: "Furniture Assembly", icon: <Hammer className="w-6 h-6" />, color: "text-indigo-600", count: 52 },
  { id: "tv", name: "TV Mounting", icon: <Monitor className="w-6 h-6" />, color: "text-gray-600", count: 39 },
  { id: "gardening", name: "Gardening", icon: <Trees className="w-6 h-6" />, color: "text-green-500", count: 63 },
  { id: "moving", name: "Moving Services", icon: <Truck className="w-6 h-6" />, color: "text-blue-500", count: 29 },
  { id: "tech", name: "Phone & Laptop Repair", icon: <Smartphone className="w-6 h-6" />, color: "text-slate-600", count: 71 },
  { id: "cctv", name: "CCTV Installation", icon: <Shield className="w-6 h-6" />, color: "text-red-500", count: 33 },
  { id: "wifi", name: "Wi-Fi Setup", icon: <Wifi className="w-6 h-6" />, color: "text-blue-400", count: 48 },
  { id: "graphics", name: "Graphic Design", icon: <PenTool className="w-6 h-6" />, color: "text-purple-500", count: 85 },
  { id: "photography", name: "Photography", icon: <Camera className="w-6 h-6" />, color: "text-teal-600", count: 94 },
  { id: "tutoring", name: "Private Tutors", icon: <BookOpen className="w-6 h-6" />, color: "text-emerald-600", count: 127 },
  { id: "makeup", name: "Makeup Artists", icon: <Heart className="w-6 h-6" />, color: "text-rose-600", count: 76 },
  { id: "hair", name: "Hair Stylists", icon: <Scissors className="w-6 h-6" />, color: "text-violet-600", count: 68 },
  { id: "fitness", name: "Fitness Trainers", icon: <Dumbbell className="w-6 h-6" />, color: "text-orange-500", count: 54 },
  { id: "massage", name: "Massage Therapy", icon: <Hand className="w-6 h-6" />, color: "text-cyan-500", count: 37 },
  { id: "dj", name: "DJ Services", icon: <Music className="w-6 h-6" />, color: "text-fuchsia-600", count: 42 },
  { id: "tailoring", name: "Tailoring", icon: <Shirt className="w-6 h-6" />, color: "text-lime-600", count: 31 },
  { id: "delivery", name: "Delivery Services", icon: <Package className="w-6 h-6" />, color: "text-sky-600", count: 96 }
];

interface CategoryGridProps {
  onCategoryClick: (categoryId: string) => void;
}

const CategoryGrid = ({ onCategoryClick }: CategoryGridProps) => {
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchProviderCounts = async () => {
      try {
        const { data, error } = await supabase
          .from('providers')
          .select('service_category');

        if (error) throw error;

        // Count providers by service category, mapping to category IDs
        const counts: Record<string, number> = {};
        data?.forEach(provider => {
          const serviceCategory = provider.service_category?.toLowerCase() || '';
          
          // Map service categories to category IDs
          const categoryMapping: Record<string, string> = {
            'plumbing': 'plumbing',
            'house cleaning': 'cleaning',
            'cleaning': 'cleaning',
            'car wash': 'carwash',
            'electrician': 'electrical',
            'electricians': 'electrical',
            'electrical': 'electrical',
            'handyman': 'handyman',
            'handyman services': 'handyman',
            'ac & fridge repair': 'appliance',
            'appliance repair': 'appliance',
            'painting': 'painting',
            'painting services': 'painting',
            'pest control': 'pest',
            'interior design': 'interior',
            'furniture assembly': 'furniture',
            'tv mounting': 'tv',
            'gardening': 'gardening',
            'home moving': 'moving',
            'moving services': 'moving',
            'phone repair': 'tech',
            'phone & laptop repair': 'tech',
            'laptop repair': 'tech',
            'cctv installation': 'cctv',
            'wi-fi setup': 'wifi',
            'graphic design': 'graphics',
            'photography': 'photography',
            'private tutors': 'tutoring',
            'tutoring': 'tutoring',
            'makeup artists': 'makeup',
            'makeup': 'makeup',
            'hair stylists': 'hair',
            'hair': 'hair',
            'fitness trainers': 'fitness',
            'fitness': 'fitness',
            'massage therapy': 'massage',
            'massage': 'massage',
            'dj services': 'dj',
            'dj': 'dj',
            'tailoring': 'tailoring',
            'delivery services': 'delivery',
            'delivery': 'delivery'
          };
          
          const categoryId = categoryMapping[serviceCategory] || serviceCategory;
          counts[categoryId] = (counts[categoryId] || 0) + 1;
        });

        setCategoryCounts(counts);
      } catch (error) {
        console.error('Error fetching provider counts:', error);
      }
    };

    fetchProviderCounts();
  }, []);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {categories.map((category) => (
        <Card 
          key={category.id}
          className="group cursor-pointer bg-card border border-border hover:border-primary hover:shadow-card transition-all duration-300 hover:scale-105"
          onClick={() => onCategoryClick(category.id)}
        >
          <CardContent className="p-4 text-center">
            <div className={`${category.color} mb-2 flex justify-center group-hover:scale-110 transition-transform duration-300`}>
              {category.icon}
            </div>
            <h3 className="font-medium text-sm text-card-foreground group-hover:text-primary transition-colors mb-1">
              {category.name}
            </h3>
            <p className="text-xs text-muted-foreground">
              {categoryCounts[category.id] || 0} providers
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default CategoryGrid;
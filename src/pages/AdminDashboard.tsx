import { useState, useEffect } from 'react';
import { ArrowLeft, Users, Shield, AlertTriangle, Settings, Search, MoreHorizontal, Ban, UserX, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface AdminDashboardProps {
  onBack: () => void;
}

interface User {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  is_suspended: boolean;
  created_at: string;
}

interface Provider {
  id: string;
  name: string;
  phone: string;
  is_verified: boolean;
  location: string;
  created_at: string;
  user_id: string;
}

interface Report {
  id: string;
  reason: string;
  description: string;
  status: string;
  created_at: string;
}

interface Category {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
  created_at: string;
}

const AdminDashboard = ({ onBack }: AdminDashboardProps) => {
  const [users, setUsers] = useState<User[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { user, userRole, hasRole, loading: authLoading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      await Promise.all([
        fetchUsers(),
        fetchProviders(),
        fetchReports(),
        fetchCategories()
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchProviders = async () => {
    try {
      const { data, error } = await supabase
        .from('providers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProviders(data || []);
    } catch (error) {
      console.error('Error fetching providers:', error);
    }
  };

  const fetchReports = async () => {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const suspendUser = async (userId: string, suspend: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_suspended: suspend })
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `User ${suspend ? 'suspended' : 'unsuspended'} successfully`,
      });

      fetchUsers();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user status",
        variant: "destructive",
      });
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      const { error } = await supabase.rpc('delete_user_account');
      
      if (error) throw error;

      toast({
        title: "Success",
        description: "User deleted successfully",
      });

      fetchUsers();
      fetchProviders();
    } catch (error) {
      toast({
        title: "Error", 
        description: "Failed to delete user",
        variant: "destructive",
      });
    }
  };

  const updateReportStatus = async (reportId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('reports')
        .update({ status })
        .eq('id', reportId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Report status updated",
      });

      fetchReports();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update report",
        variant: "destructive",
      });
    }
  };

  const toggleCategory = async (categoryId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('categories')
        .update({ is_active: isActive })
        .eq('id', categoryId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Category ${isActive ? 'activated' : 'deactivated'}`,
      });

      fetchCategories();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update category",
        variant: "destructive",
      });
    }
  };

  const filteredUsers = users.filter(user => 
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredProviders = providers.filter(provider =>
    provider.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Show loading state while auth is loading
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl md:text-3xl font-bold">Admin Dashboard</h1>
          </div>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  // Check if user is authenticated and has admin role
  if (!user) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl md:text-3xl font-bold">Admin Dashboard</h1>
          </div>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              You must be signed in to access the admin dashboard.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  // Check if user has admin role
  if (!hasRole('admin')) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl md:text-3xl font-bold">Admin Dashboard</h1>
          </div>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Access denied. You need administrator privileges to access this page. Current role: {userRole || 'user'}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl md:text-3xl font-bold">Admin Dashboard</h1>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-6 bg-muted rounded w-full mb-2"></div>
                  <div className="h-8 bg-muted rounded w-16"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage users, providers, and platform activity</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold">{users.length}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Providers</p>
                  <p className="text-2xl font-bold">{providers.length}</p>
                </div>
                <Shield className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending Reports</p>
                  <p className="text-2xl font-bold">{reports.filter(r => r.status === 'pending').length}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Categories</p>
                  <p className="text-2xl font-bold">{categories.filter(c => c.is_active).length}</p>
                </div>
                <Settings className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search users, providers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="providers">Providers</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.full_name || 'N/A'}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              user
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={user.is_suspended ? "destructive" : "default"}>
                              {user.is_suspended ? 'Suspended' : 'Active'}
                            </Badge>
                          </TableCell>
                          <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => suspendUser(user.id, !user.is_suspended)}>
                                  <Ban className="mr-2 h-4 w-4" />
                                  {user.is_suspended ? 'Unsuspend' : 'Suspend'}
                                </DropdownMenuItem>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                      <UserX className="mr-2 h-4 w-4" />
                                      Delete User
                                    </DropdownMenuItem>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete User</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This will permanently delete the user and all their data.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => deleteUser(user.id)}>
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="providers">
            <Card>
              <CardHeader>
                <CardTitle>Provider Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProviders.map((provider) => (
                        <TableRow key={provider.id}>
                          <TableCell className="font-medium">{provider.name}</TableCell>
                          <TableCell>{provider.phone || 'N/A'}</TableCell>
                          <TableCell>{provider.location || 'N/A'}</TableCell>
                          <TableCell>
                            <Badge variant={provider.is_verified ? "default" : "secondary"}>
                              {provider.is_verified ? 'Verified' : 'Pending'}
                            </Badge>
                          </TableCell>
                          <TableCell>{new Date(provider.created_at).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => suspendUser(provider.user_id, true)}>
                                  <Ban className="mr-2 h-4 w-4" />
                                  Suspend
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>Reports & Complaints</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Reporter</TableHead>
                        <TableHead>Reported User</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reports.map((report) => (
                        <TableRow key={report.id}>
                          <TableCell>Anonymous</TableCell>
                          <TableCell>N/A</TableCell>
                          <TableCell>{report.reason}</TableCell>
                          <TableCell>
                            <Badge 
                              variant={
                                report.status === 'pending' ? 'secondary' :
                                report.status === 'resolved' ? 'default' : 'destructive'
                              }
                            >
                              {report.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{new Date(report.created_at).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => updateReportStatus(report.id, 'reviewed')}>
                                  Mark as Reviewed
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => updateReportStatus(report.id, 'resolved')}>
                                  Mark as Resolved
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => updateReportStatus(report.id, 'dismissed')}>
                                  Dismiss
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories">
            <Card>
              <CardHeader>
                <CardTitle>Category Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {categories.map((category) => (
                        <TableRow key={category.id}>
                          <TableCell className="font-medium">{category.name}</TableCell>
                          <TableCell>{category.description}</TableCell>
                          <TableCell>
                            <Badge variant={category.is_active ? "default" : "secondary"}>
                              {category.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell>{new Date(category.created_at).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleCategory(category.id, !category.is_active)}
                            >
                              {category.is_active ? 'Deactivate' : 'Activate'}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
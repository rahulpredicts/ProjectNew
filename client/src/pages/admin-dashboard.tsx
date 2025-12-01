import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Users, TrendingUp, Car, DollarSign, Shield, Loader2 } from "lucide-react";
import type { User } from "@shared/schema";
import { useState } from "react";

export default function AdminDashboard() {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const [updatingRole, setUpdatingRole] = useState<string | null>(null);

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-slate-400">Admin access required</p>
        </div>
      </div>
    );
  }

  const { data: allUsers = [], isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ['/api/admin/users'],
    retry: false,
  });

  const { data: carCounts = {} as any } = useQuery({
    queryKey: ['/api/cars/counts'],
    retry: false,
  });

  const dealerCount = allUsers.filter(u => u.role === 'dealer').length;
  const adminCount = allUsers.filter(u => u.role === 'admin').length;
  const dataAnalystCount = allUsers.filter(u => u.role === 'data_analyst').length;

  const handleRoleChange = async (userId: string, newRole: 'admin' | 'dealer' | 'data_analyst') => {
    try {
      setUpdatingRole(userId);
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) {
        throw new Error('Failed to update user role');
      }

      toast({
        title: "Success",
        description: `User role updated to ${newRole}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update role",
        variant: "destructive",
      });
    } finally {
      setUpdatingRole(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-slate-400">Manage users, inventory, and system settings</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-5 gap-6 mb-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Users</p>
                  <p className="text-3xl font-bold">{allUsers.length}</p>
                </div>
                <Users className="w-10 h-10 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Dealers</p>
                  <p className="text-3xl font-bold">{dealerCount}</p>
                </div>
                <Car className="w-10 h-10 text-cyan-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Admins</p>
                  <p className="text-3xl font-bold">{adminCount}</p>
                </div>
                <Shield className="w-10 h-10 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Data Analysts</p>
                  <p className="text-3xl font-bold">{dataAnalystCount}</p>
                </div>
                <Users className="w-10 h-10 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Vehicles</p>
                  <p className="text-3xl font-bold">{carCounts?.total || 0}</p>
                </div>
                <DollarSign className="w-10 h-10 text-green-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Users Management */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>Manage user roles and permissions</CardDescription>
          </CardHeader>
          <CardContent>
            {usersLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-slate-700">
                    <tr>
                      <th className="text-left py-3 px-4 font-semibold">Email</th>
                      <th className="text-left py-3 px-4 font-semibold">Name</th>
                      <th className="text-left py-3 px-4 font-semibold">Role</th>
                      <th className="text-left py-3 px-4 font-semibold">Joined</th>
                      <th className="text-left py-3 px-4 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {allUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-700/30 transition-colors">
                        <td className="py-3 px-4 text-slate-300">{u.email}</td>
                        <td className="py-3 px-4 text-slate-300">
                          {u.firstName || u.lastName 
                            ? `${u.firstName || ''} ${u.lastName || ''}`.trim()
                            : 'N/A'}
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={u.role === 'admin' ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-blue-600 hover:bg-blue-700'}>
                            {u.role}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-slate-400">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            {u.role === 'admin' ? (
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-blue-600 text-blue-400 hover:bg-blue-600/10"
                                onClick={() => handleRoleChange(u.id, 'dealer')}
                                disabled={updatingRole === u.id}
                                data-testid={`button-demote-${u.id}`}
                              >
                                {updatingRole === u.id ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  'Demote to Dealer'
                                )}
                              </Button>
                            ) : u.role === 'dealer' ? (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-yellow-600 text-yellow-400 hover:bg-yellow-600/10"
                                  onClick={() => handleRoleChange(u.id, 'admin')}
                                  disabled={updatingRole === u.id}
                                  data-testid={`button-promote-admin-${u.id}`}
                                >
                                  {updatingRole === u.id ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : (
                                    'Admin'
                                  )}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-purple-600 text-purple-400 hover:bg-purple-600/10"
                                  onClick={() => handleRoleChange(u.id, 'data_analyst')}
                                  disabled={updatingRole === u.id}
                                  data-testid={`button-promote-analyst-${u.id}`}
                                >
                                  {updatingRole === u.id ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : (
                                    'Analyst'
                                  )}
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-yellow-600 text-yellow-400 hover:bg-yellow-600/10"
                                  onClick={() => handleRoleChange(u.id, 'admin')}
                                  disabled={updatingRole === u.id}
                                  data-testid={`button-promote-admin-${u.id}`}
                                >
                                  {updatingRole === u.id ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : (
                                    'Admin'
                                  )}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-blue-600 text-blue-400 hover:bg-blue-600/10"
                                  onClick={() => handleRoleChange(u.id, 'dealer')}
                                  disabled={updatingRole === u.id}
                                  data-testid={`button-demote-dealer-${u.id}`}
                                >
                                  {updatingRole === u.id ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : (
                                    'Dealer'
                                  )}
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

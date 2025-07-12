import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/auth-context';
import { BarChart, Users, MessageSquare, Flag, Ban, CheckCircle, XCircle } from 'lucide-react';

// Mock admin data
const mockAdminData = {
  stats: {
    totalUsers: 1247,
    totalQuestions: 3892,
    totalAnswers: 7234,
    pendingReports: 12,
  },
  recentReports: [
    {
      id: '1',
      type: 'question',
      title: 'Inappropriate content in question',
      reporter: 'user123',
      reported: 'spammer456',
      reason: 'Spam/self-promotion',
      status: 'pending',
    },
    {
      id: '2',
      type: 'answer',
      title: 'Offensive language in answer',
      reporter: 'moderator1',
      reported: 'user789',
      reason: 'Inappropriate language',
      status: 'pending',
    },
  ],
  recentUsers: [
    {
      id: '1',
      username: 'newuser1',
      email: 'newuser1@example.com',
      joinDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
      reputation: 1,
      status: 'active',
    },
    {
      id: '2',
      username: 'newuser2',
      email: 'newuser2@example.com',
      joinDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      reputation: 15,
      status: 'active',
    },
  ],
};

export function Admin() {
  const { user } = useAuth();
  const [adminData] = useState(mockAdminData);

  if (!user || user.role !== 'admin') {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
        <p className="text-muted-foreground">You don't have permission to access this page.</p>
      </div>
    );
  }

  const handleReportAction = (reportId: string, action: 'approve' | 'reject') => {
    console.log(`${action} report ${reportId}`);
  };

  const handleUserAction = (userId: string, action: 'ban' | 'unban') => {
    console.log(`${action} user ${userId}`);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage your StackIt community</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{adminData.stats.totalUsers}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Questions</p>
                <p className="text-2xl font-bold">{adminData.stats.totalQuestions}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Answers</p>
                <p className="text-2xl font-bold">{adminData.stats.totalAnswers}</p>
              </div>
              <BarChart className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Reports</p>
                <p className="text-2xl font-bold text-orange-500">{adminData.stats.pendingReports}</p>
              </div>
              <Flag className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="reports" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
        </TabsList>
        
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {adminData.recentReports.map((report) => (
                  <div key={report.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge variant="secondary">{report.type}</Badge>
                          <Badge variant="outline">{report.status}</Badge>
                        </div>
                        <h3 className="font-semibold">{report.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Reported by <strong>{report.reporter}</strong> against <strong>{report.reported}</strong>
                        </p>
                        <p className="text-sm text-muted-foreground">Reason: {report.reason}</p>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReportAction(report.id, 'approve')}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleReportAction(report.id, 'reject')}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {adminData.recentUsers.map((user) => (
                  <div key={user.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{user.username}</h3>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <p className="text-sm text-muted-foreground">
                          Reputation: {user.reputation} • Joined: {user.joinDate.toLocaleDateString()}
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Badge variant={user.status === 'active' ? 'default' : 'destructive'}>
                          {user.status}
                        </Badge>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleUserAction(user.id, 'ban')}
                        >
                          <Ban className="h-4 w-4 mr-1" />
                          Ban
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Content Moderation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Content moderation tools would go here...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
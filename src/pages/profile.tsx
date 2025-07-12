import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/auth-context';
import { ArrowUp, MessageSquare, Trophy, Calendar } from 'lucide-react';

// Mock user data
const mockUserData = {
  questionsAsked: 12,
  answersGiven: 28,
  reputation: 1250,
  joinDate: new Date('2023-06-15'),
  badgesEarned: [
    { name: 'Student', description: 'Asked first question', icon: '🎓' },
    { name: 'Scholar', description: 'Asked 10 questions', icon: '📚' },
    { name: 'Teacher', description: 'Answered 25 questions', icon: '👨‍🏫' },
  ],
  recentActivity: [
    {
      type: 'question',
      title: 'How to implement JWT authentication?',
      votes: 5,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
    {
      type: 'answer',
      title: 'Best practices for React hooks',
      votes: 8,
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
    },
    {
      type: 'question',
      title: 'CSS Grid vs Flexbox comparison',
      votes: 12,
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    },
  ],
};

export function Profile() {
  const { user } = useAuth();
  const [userData] = useState(mockUserData);

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Please log in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start space-x-6">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="text-2xl">
                {user.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{user.username}</h1>
              <p className="text-muted-foreground">{user.email}</p>
              
              <div className="flex items-center space-x-4 mt-4">
                <div className="flex items-center space-x-1">
                  <Trophy className="h-4 w-4 text-yellow-500" />
                  <span className="font-semibold">{userData.reputation}</span>
                  <span className="text-sm text-muted-foreground">reputation</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm text-muted-foreground">
                    Joined {formatDistanceToNow(userData.joinDate, { addSuffix: true })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-blue-600">{userData.questionsAsked}</div>
            <div className="text-sm text-muted-foreground">Questions Asked</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-green-600">{userData.answersGiven}</div>
            <div className="text-sm text-muted-foreground">Answers Given</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-purple-600">{userData.badgesEarned.length}</div>
            <div className="text-sm text-muted-foreground">Badges Earned</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="activity" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          <TabsTrigger value="badges">Badges</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userData.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-1">
                        {activity.type === 'question' ? (
                          <MessageSquare className="h-4 w-4 text-blue-500" />
                        ) : (
                          <ArrowUp className="h-4 w-4 text-green-500" />
                        )}
                        <span className="text-sm text-muted-foreground capitalize">
                          {activity.type}
                        </span>
                      </div>
                      <span className="font-medium">{activity.title}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <span>{activity.votes} votes</span>
                      <span>{formatDistanceToNow(activity.timestamp, { addSuffix: true })}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="badges" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Badges Earned</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userData.badgesEarned.map((badge, index) => (
                  <div key={index} className="flex items-center space-x-3 p-4 border rounded-lg">
                    <span className="text-2xl">{badge.icon}</span>
                    <div>
                      <h3 className="font-semibold">{badge.name}</h3>
                      <p className="text-sm text-muted-foreground">{badge.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Settings panel would go here...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
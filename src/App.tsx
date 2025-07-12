import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/components/theme/theme-provider';
import { AuthProvider } from '@/contexts/auth-context';
import { NotificationProvider } from '@/contexts/notification-context';
import { Toaster } from '@/components/ui/sonner';
import { Layout } from '@/components/layout/layout';
import { Home } from '@/pages/home';
import { QuestionDetail } from '@/pages/question-detail';
import { AskQuestion } from '@/pages/ask-question';
import { Profile } from '@/pages/profile';
import { Admin } from '@/pages/admin';
import { Login } from '@/pages/auth/login';
import { Register } from '@/pages/auth/register';
import { NotificationCenter } from '@/components/notifications/notification-center';
import './App.css';

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="stackit-ui-theme">
      <AuthProvider>
        <NotificationProvider>
          <Router>
            <div className="min-h-screen bg-background">
              <Layout>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/ask" element={<AskQuestion />} />
                  <Route path="/question/:id" element={<QuestionDetail />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/admin" element={<Admin />} />
                </Routes>
              </Layout>
              <NotificationCenter />
              <Toaster />
            </div>
          </Router>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
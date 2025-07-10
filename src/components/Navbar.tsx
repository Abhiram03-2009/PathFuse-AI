
import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useTheme } from '@/contexts/ThemeContext';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import pathFuseLogo from '/lovable-uploads/ae5bc441-3df5-4789-a85f-89d17eafc98b.png';

const Navbar = () => {
  const { user, profile, signOut } = useAuth();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const handleLogoClick = () => {
    navigate('/');
  };

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <nav className={`${isDarkMode ? 'bg-gradient-to-r from-slate-900 via-gray-900 to-slate-800 border-cyan-400/20' : 'bg-gradient-to-r from-white via-blue-50 to-indigo-50 border-blue-300/40'} border-b px-4 py-3 relative overflow-hidden transition-all duration-300`}>
      {/* Animated background elements with enhanced neon bubbles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={`absolute -top-4 -left-4 w-72 h-72 ${isDarkMode ? 'bg-cyan-400/8' : 'bg-cyan-400/12'} rounded-full animate-float`}></div>
        <div className={`absolute -bottom-8 -right-8 w-96 h-96 ${isDarkMode ? 'bg-purple-400/8' : 'bg-purple-400/12'} rounded-full animate-float`} style={{animationDelay: '2s'}}></div>
        <div className={`absolute top-1/2 left-1/2 w-64 h-64 ${isDarkMode ? 'bg-blue-400/6' : 'bg-blue-400/10'} rounded-full animate-float`} style={{animationDelay: '4s'}}></div>
        
        {/* Enhanced floating bubbles */}
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className={`floating-bubble bubble-neon w-${Math.floor(Math.random() * 3) + 2} h-${Math.floor(Math.random() * 3) + 2} animate-bubble-${(i % 3) + 1}`}
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 20}s`,
              animationDuration: `${25 + Math.random() * 15}s`
            }}
          />
        ))}
      </div>
      
      <div className="container mx-auto flex justify-between items-center relative z-10">
        <div className="flex items-center space-x-3 cursor-pointer group" onClick={handleLogoClick}>
          <div className="relative">
            <div className={`absolute inset-0 ${isDarkMode ? 'bg-gradient-to-r from-cyan-400/20 to-purple-400/20' : 'bg-gradient-to-r from-blue-400/25 to-purple-400/25'} rounded-xl blur-lg group-hover:from-cyan-400/30 group-hover:to-purple-400/30 transition-all duration-500 animate-pulse-glow`}></div>
            <div className={`relative ${isDarkMode ? 'bg-gray-800/40 border-cyan-400/20' : 'bg-white/60 border-blue-300/30'} backdrop-blur-lg rounded-xl p-3 border neon-border`}>
              <img src={pathFuseLogo} alt="Path Fuse AI Logo" className="w-12 h-12 object-contain" />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent animate-neon-flicker">
              Path Fuse AI
            </h1>
            <p className={`text-xs animate-fade-in ${isDarkMode ? 'text-cyan-400' : 'text-blue-600'}`}>Your AI Career Assistant</p>
          </div>
        </div>

        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-transparent">
                <Avatar className={`h-10 w-10 border-2 ${isDarkMode ? 'border-cyan-400/30' : 'border-blue-400/40'}`}>
                  <AvatarImage src={profile?.avatar_url || ''} alt={profile?.full_name || 'User'} />
                  <AvatarFallback className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white">
                    {getInitials(profile?.full_name)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className={`w-56 ${isDarkMode ? 'bg-gray-900/95 border-cyan-400/30' : 'bg-white/95 border-blue-300/40'} backdrop-blur-lg border`} align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className={`text-sm font-medium leading-none ${isDarkMode ? 'text-cyan-400' : 'text-blue-600'}`}>
                    {profile?.full_name || 'User'}
                  </p>
                  <p className={`text-xs leading-none ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className={`${isDarkMode ? 'bg-cyan-400/20' : 'bg-blue-300/30'}`} />
              <DropdownMenuItem className={`${isDarkMode ? 'text-gray-300 hover:text-cyan-400 hover:bg-cyan-400/10' : 'text-gray-700 hover:text-blue-600 hover:bg-blue-400/10'}`}>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator className={`${isDarkMode ? 'bg-cyan-400/20' : 'bg-blue-300/30'}`} />
              <DropdownMenuItem onClick={handleSignOut} className="text-red-400 hover:text-red-300 hover:bg-red-400/10">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

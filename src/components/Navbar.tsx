
import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Navbar = () => {
  const { user, profile, signOut } = useAuth();
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
    <nav className="bg-gradient-to-r from-gray-900 via-purple-900 to-gray-900 border-b border-cyan-400/30 px-4 py-3 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-4 -left-4 w-72 h-72 bg-cyan-400/10 rounded-full animate-float"></div>
        <div className="absolute -bottom-8 -right-8 w-96 h-96 bg-purple-400/10 rounded-full animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-blue-400/10 rounded-full animate-float" style={{animationDelay: '4s'}}></div>
      </div>
      
      <div className="container mx-auto flex justify-between items-center relative z-10">
        <div 
          className="flex items-center space-x-3 cursor-pointer group"
          onClick={handleLogoClick}
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/30 to-purple-400/30 rounded-xl blur-lg group-hover:from-cyan-400/50 group-hover:to-purple-400/50 transition-all duration-500 animate-pulse-glow"></div>
            <div className="relative bg-gray-800/50 backdrop-blur-lg rounded-xl p-3 border border-cyan-400/30 neon-border">
              <img 
                src="/lovable-uploads/81472227-0dd6-4225-b9a0-2ff50bbe4f1c.png" 
                alt="Resumate AI Logo" 
                className="w-8 h-8 object-contain"
              />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent animate-neon-flicker">
              Resumate AI
            </h1>
            <p className="text-xs text-cyan-400 animate-fade-in">Your AI Career Assistant</p>
          </div>
        </div>

        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10 border-2 border-cyan-400/30">
                  <AvatarImage src={profile?.avatar_url || ''} alt={profile?.full_name || 'User'} />
                  <AvatarFallback className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white">
                    {getInitials(profile?.full_name)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-gray-900/95 backdrop-blur-lg border-cyan-400/30" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none text-cyan-400">
                    {profile?.full_name || 'User'}
                  </p>
                  <p className="text-xs leading-none text-gray-300">
                    {user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-cyan-400/20" />
              <DropdownMenuItem className="text-gray-300 hover:text-cyan-400 hover:bg-cyan-400/10">
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-cyan-400/20" />
              <DropdownMenuItem 
                onClick={handleSignOut}
                className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
              >
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

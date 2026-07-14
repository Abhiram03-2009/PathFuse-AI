import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Moon, Sun, LogOut, Save, Settings as SettingsIcon, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface SettingsMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SettingsMenu = ({ open, onOpenChange }: SettingsMenuProps) => {
  const { user, profile, updateProfile, signOut } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [name, setName] = useState(profile?.full_name || '');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const getInitials = (n: string | null) => {
    if (!n) return 'U';
    return n.split(' ').map((p) => p[0]).join('').toUpperCase().slice(0, 2);
  };

  const saveName = async () => {
    setSaving(true);
    const { error } = await updateProfile({ full_name: name });
    setSaving(false);
    if (error) {
      toast({ title: 'Update failed', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Saved', description: 'Your name has been updated.' });
    }
  };

  const handleSignOut = async () => {
    onOpenChange(false);
    await signOut();
    navigate('/auth');
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      const { data, error } = await supabase.functions.invoke('delete-account');
      if (error) throw new Error(error.message || 'Failed to delete account');
      if (data?.error) throw new Error(data.error);
      toast({ title: 'Account deleted', description: 'Your account and data have been removed.' });
      navigate('/auth');
    } catch (e: any) {
      toast({ title: 'Delete failed', description: e.message, variant: 'destructive' });
    } finally {
      setDeleting(false);
      setConfirmDeleteOpen(false);
    }
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="left"
          className={`${isDarkMode ? 'bg-gray-900 border-cyan-400/20 text-white' : 'bg-white border-blue-300/40'} w-80 flex flex-col`}
        >
          <SheetHeader>
            <SheetTitle className={`flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              <SettingsIcon className="w-5 h-5" />Settings
            </SheetTitle>
          </SheetHeader>

          <div className="mt-6 space-y-6 flex-1">
            <div className="flex items-center gap-3">
              <Avatar className={`h-12 w-12 border-2 ${isDarkMode ? 'border-cyan-400/30' : 'border-blue-400/40'}`}>
                <AvatarImage src={profile?.avatar_url || ''} alt={profile?.full_name || 'User'} />
                <AvatarFallback className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white">
                  {getInitials(profile?.full_name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className={`text-sm font-medium truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{profile?.full_name || 'User'}</p>
                <p className={`text-xs truncate ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{user?.email}</p>
              </div>
            </div>

            <Separator className={isDarkMode ? 'bg-cyan-400/20' : 'bg-blue-300/30'} />

            <div className="space-y-2">
              <Label htmlFor="settings-name" className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Display name</Label>
              <div className="flex gap-2">
                <Input
                  id="settings-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={isDarkMode ? 'bg-gray-800/50 border-cyan-400/30 text-white' : 'bg-white border-blue-300/50'}
                />
                <Button onClick={saveName} disabled={saving || name === profile?.full_name} size="icon" variant="outline">
                  <Save className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <Separator className={isDarkMode ? 'bg-cyan-400/20' : 'bg-blue-300/30'} />

            <div className="flex items-center justify-between">
              <Label className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Appearance</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleDarkMode}
                className={isDarkMode ? 'border-cyan-400/30 text-cyan-300' : 'border-blue-300/50 text-blue-600'}
              >
                {isDarkMode ? <Sun className="w-4 h-4 mr-2" /> : <Moon className="w-4 h-4 mr-2" />}
                {isDarkMode ? 'Light Mode' : 'Dark Mode'}
              </Button>
            </div>

            <Separator className={isDarkMode ? 'bg-cyan-400/20' : 'bg-blue-300/30'} />

            <Button
              variant="outline"
              onClick={handleSignOut}
              className="w-full text-red-400 border-red-400/30 hover:bg-red-400/10"
            >
              <LogOut className="w-4 h-4 mr-2" />Sign Out
            </Button>

            <Button
              variant="ghost"
              onClick={() => setConfirmDeleteOpen(true)}
              className="w-full text-red-500/70 hover:text-red-400 hover:bg-red-400/10"
            >
              <Trash2 className="w-4 h-4 mr-2" />Delete Account
            </Button>
          </div>

          <p className={`text-center text-xs pt-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            PathFuse AI v1.0.0
          </p>
        </SheetContent>
      </Sheet>

      <AlertDialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete your account?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes your account and everything you've saved -
              resumes, cover letters, LinkedIn reports, keyword analyses, saved jobs
              and colleges. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => { e.preventDefault(); handleDeleteAccount(); }}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? 'Deleting…' : 'Delete Account'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default SettingsMenu;

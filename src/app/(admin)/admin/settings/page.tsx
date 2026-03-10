"use client";

import { useState, useEffect } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/AuthContext";
import { createClient } from "@/lib/supabase/client";
import React from "react";

export default function AdminSettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const [adminProfile, setAdminProfile] = useState({
    display_name: '',
    email: '',
    phone: ''
  });
  const [stats, setStats] = useState([
          { label: "Total utilisateurs", value: "Chargement..." },
          { label: "Total analyses", value: "Chargement..." },
          { label: "Cultures supportées", value: "22" },
          { label: "Précision du modèle", value: "99.55%" },
          { label: "Temps de réponse API", value: "120ms" },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (authLoading || !user) return;

      try {
        const supabase = createClient();
        setLoading(true);

        const [profileResult, totalUs, totalAn] = await Promise.all([
          supabase
            .from('profiles')
            .select('display_name, email, phone')
            .eq('id', user.id)
            .single(),
          supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true }),
          supabase
            .from('analyses')
            .select('*', { count: 'exact', head: true })
        ]);

        if (profileResult.data) {
          setAdminProfile({
            display_name: profileResult.data.display_name || '',
            email: profileResult.data.email || '',
            phone: profileResult.data.phone || ''
          });
        }

        setStats([
          { label: "Total utilisateurs", value: (totalUs.count || 0).toLocaleString() },
          { label: "Total analyses", value: (totalAn.count || 0).toLocaleString() },
          { label: "Cultures supportées", value: "22" },
          { label: "Précision du modèle", value: "99.55%" },
          { label: "Temps de réponse API", value: "120ms" },
        ]);
      } catch (error) {
        console.error('Error fetching admin settings data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, authLoading]);

  const DangerButton = ({ children, variant = 'destructive' } : { children: React.ReactNode, variant?: 'destructive' | 'secondary' }) => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant={variant} className="w-full justify-start">{children}</Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="w-full max-w-[95vw] md:max-w-2xl max-h-[90vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
      <div className="lg:col-span-3 space-y-8">
        <Card className="p-0">
           <CardHeader className="p-6">
            <CardTitle>Profil administrateur</CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0 space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src="https://picsum.photos/seed/admin/200/200" alt="Admin avatar" data-ai-hint="person portrait" />
                <AvatarFallback className="bg-primary text-2xl">A</AvatarFallback>
              </Avatar>
              <Button variant="outline">Changer la photo</Button>
            </div>
             <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Nom complet</Label>
                <Input id="fullName" defaultValue={adminProfile.display_name || ''} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue={adminProfile.email || ''} disabled />
              </div>
               <div className="space-y-2">
                <Label htmlFor="phone">Téléphone</Label>
                <Input id="phone" type="tel" defaultValue={adminProfile.phone || ''} />
              </div>
            </div>
            <Button>Enregistrer</Button>
          </CardContent>
        </Card>
        
        <Card className="p-0">
          <CardHeader className="p-6">
            <CardTitle>Paramètres globaux</CardTitle>
            <CardDescription>Les modifications affecteront tous les utilisateurs.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-0 space-y-4">
             <div className="flex items-center justify-between p-4 rounded-lg bg-card hover:bg-secondary">
              <Label htmlFor="allow-regs" className="flex-1 cursor-pointer">Allow new registrations</Label>
              <Switch id="allow-regs" defaultChecked />
            </div>
             <div className="flex items-center justify-between p-4 rounded-lg bg-card hover:bg-secondary">
              <Label htmlFor="verify-email" className="flex-1 cursor-pointer">Require email verification</Label>
              <Switch id="verify-email" />
            </div>
             <div className="flex items-center justify-between p-4 rounded-lg bg-card hover:bg-secondary">
              <Label htmlFor="google-signin" className="flex-1 cursor-pointer">Enable Google Sign-in</Label>
              <Switch id="google-signin" defaultChecked />
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-card hover:bg-secondary">
              <Label htmlFor="show-confidence" className="flex-1 cursor-pointer">Show confidence scores to users</Label>
              <Switch id="show-confidence" defaultChecked />
            </div>
             <Button className="mt-4">Save Configuration</Button>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-2 space-y-8">
        <Card className="p-0">
           <CardHeader className="p-6">
            <CardTitle>Vue d'ensemble de la plateforme</CardTitle>
          </CardHeader>
           <CardContent className="p-6 pt-0 space-y-4">
            {stats.map((stat, index) => (
              <React.Fragment key={stat.label}>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">{stat.label}</span>
                  <span className="font-bold text-white">{stat.value}</span>
                </div>
                {index < stats.length -1 && <Separator />}
              </React.Fragment>
            ))}
          </CardContent>
        </Card>

        <Card className="border-destructive/25 bg-card p-0">
          <CardHeader className="p-6">
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
            <CardDescription>Perform irreversible actions.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-0 space-y-3">
             <DangerButton variant="secondary">Export All Data (CSV)</DangerButton>
             <DangerButton>Clear All Analyses</DangerButton>
             <DangerButton>Reset Platform</DangerButton>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

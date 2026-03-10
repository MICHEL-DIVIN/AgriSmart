"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { createClient } from "@/lib/supabase/client";

export default function SettingsPage() {
  const { user, loading, userRole } = useAuth();
  const [profile, setProfile] = useState({
    display_name: '',
    email: '',
    role: 'user',
    organization: '',
    phone: ''
  });
  const [saving, setSaving] = useState(false);
  const [defaultSoilValues, setDefaultSoilValues] = useState({
    n: 85,
    p: 42,
    k: 210,
    temperature: 24.5,
    humidity: 72,
    ph: 6.4,
    rainfall: 180
  });
  const [analysesCount, setAnalysesCount] = useState<number | null>(null);
  const [preferences, setPreferences] = useState({
    save_automatically: true,
    show_confidence_percentage: true,
    enable_notifications: false,
    show_alternative_crops: true
  });

  useEffect(() => {
    const fetchData = async () => {
      if (loading || !user) return;
      
      const supabase = createClient();
      
      try {
        const [profileResult, lastAnalysisResult, countResult, preferencesResult] = await Promise.all([
          supabase
            .from('profiles')
            .select('display_name, email, role, organization, phone')
            .eq('id', user.id)
            .single(),
          supabase
            .from('analyses')
            .select('n, p, k, temperature, humidity, ph, rainfall')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single(),
          supabase
            .from('analyses')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id),
          supabase
            .from('profiles')
            .select('preferences')
            .eq('id', user.id)
            .single()
        ]);

        if (profileResult.data) {
          setProfile({
            display_name: profileResult.data.display_name || '',
            email: profileResult.data.email || user.email || '',
            role: profileResult.data.role || 'user',
            organization: profileResult.data.organization || '',
            phone: profileResult.data.phone || ''
          });
        } else if (!profileResult.data && user.email) {
          setProfile(prev => ({
            ...prev,
            email: user.email || ''
          }));
        }

        if (lastAnalysisResult.data) {
          setDefaultSoilValues({
            n: lastAnalysisResult.data.n,
            p: lastAnalysisResult.data.p,
            k: lastAnalysisResult.data.k,
            temperature: lastAnalysisResult.data.temperature,
            humidity: lastAnalysisResult.data.humidity,
            ph: lastAnalysisResult.data.ph,
            rainfall: lastAnalysisResult.data.rainfall
          });
        }

        if (countResult.count !== null) {
          setAnalysesCount(countResult.count);
        }

        if (preferencesResult.data?.preferences) {
          setPreferences({
            save_automatically: preferencesResult.data.preferences.save_automatically ?? true,
            show_confidence_percentage: preferencesResult.data.preferences.show_confidence_percentage ?? true,
            enable_notifications: preferencesResult.data.preferences.enable_notifications ?? false,
            show_alternative_crops: preferencesResult.data.preferences.show_alternative_crops ?? true
          });
        }
      } catch (error) {
        console.error('Error fetching settings data:', error);
      }
    };

    fetchData();
  }, [user, loading]);

  const handlePreferenceChange = async (key: keyof typeof preferences, value: boolean) => {
    if (!user) return;

    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);

    try {
      const supabase = createClient();
      await supabase
        .from('profiles')
        .update({ preferences: newPreferences })
        .eq('id', user.id);
    } catch (error) {
      console.error('Error saving preferences:', error);
      // Revert on error
      setPreferences(preferences);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    
    const supabase = createClient();
    setSaving(true);
    
    // Empêcher les utilisateurs non-admin de changer leur rôle
    const updateData: any = {
      display_name: profile.display_name,
      organization: profile.organization,
      phone: profile.phone,
      updated_at: new Date().toISOString()
    };
    
    // Seuls les admins peuvent modifier leur rôle
    if (userRole === 'admin') {
      updateData.role = profile.role;
    }
    
    await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', user.id);
    setSaving(false);
  };

  const getInitials = (name: string) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };
  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 animate-fade-in">
      <div className="lg:col-span-3 space-y-6">
        <Card className="p-0">
          <CardHeader className="p-6">
            <CardTitle>Paramètres du profil</CardTitle>
            <CardDescription>Gérez vos informations de compte</CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-0 space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src="/placeholder-user.jpg" alt="User avatar" data-ai-hint="person portrait" />
                <AvatarFallback className="bg-primary text-2xl">{getInitials(profile.display_name || profile.email)}</AvatarFallback>
              </Avatar>
              <Button variant="outline">Changer la photo</Button>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Nom complet</Label>
                <Input 
                  id="fullName" 
                  value={profile.display_name}
                  onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Adresse email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={profile.email}
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Rôle</Label>
                {userRole === 'admin' ? (
                  <Select 
                    value={profile.role}
                    onValueChange={(value) => setProfile({ ...profile, role: value })}
                  >
                    <SelectTrigger id="role">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Input 
                    id="role" 
                    value={profile.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
                    disabled
                    className="capitalize"
                  />
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="organization">Organisation</Label>
                <Input 
                  id="organization" 
                  value={profile.organization}
                  onChange={(e) => setProfile({ ...profile, organization: e.target.value })}
                />
              </div>
            </div>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </CardContent>
        </Card>

        <Card className="p-0">
          <CardHeader className="p-6">
            <CardTitle>Valeurs de sol par défaut</CardTitle>
            <CardDescription>Pré-remplir le formulaire d'analyse avec vos valeurs de sol typiques.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-0 space-y-4">
             <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="defaultN">Azote (N)</Label>
                    <Input id="defaultN" defaultValue={defaultSoilValues.n} />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="defaultP">Phosphore (P)</Label>
                    <Input id="defaultP" defaultValue={defaultSoilValues.p} />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="defaultK">Potassium (K)</Label>
                    <Input id="defaultK" defaultValue={defaultSoilValues.k} />
                </div>
             </div>
             <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="defaultTemp">Température</Label>
                    <Input id="defaultTemp" defaultValue={defaultSoilValues.temperature} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="defaultHumidity">Humidité</Label>
                    <Input id="defaultHumidity" defaultValue={defaultSoilValues.humidity} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="defaultPh">pH</Label>
                    <Input id="defaultPh" defaultValue={defaultSoilValues.ph} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="defaultRainfall">Pluviométrie</Label>
                    <Input id="defaultRainfall" defaultValue={defaultSoilValues.rainfall} />
                </div>
             </div>
            <Button>Enregistrer les valeurs par défaut</Button>
          </CardContent>
        </Card>
      </div>
      <div className="lg:col-span-2 space-y-6">
        <Card className="p-0">
          <CardHeader className="p-6">
            <CardTitle>Préférences</CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0 space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="autoSave" className="flex-1">Sauvegarder automatiquement</Label>
              <Switch 
                id="autoSave" 
                checked={preferences.save_automatically}
                onCheckedChange={(checked) => handlePreferenceChange('save_automatically', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="showPercent" className="flex-1">Afficher la confiance en pourcentage</Label>
              <Switch 
                id="showPercent" 
                checked={preferences.show_confidence_percentage}
                onCheckedChange={(checked) => handlePreferenceChange('show_confidence_percentage', checked)}
              />
            </div>
             <div className="flex items-center justify-between">
              <Label htmlFor="notifications" className="flex-1">Activer les notifications</Label>
              <Switch 
                id="notifications" 
                checked={preferences.enable_notifications}
                onCheckedChange={(checked) => handlePreferenceChange('enable_notifications', checked)}
              />
            </div>
             <div className="flex items-center justify-between">
              <Label htmlFor="showAlternatives" className="flex-1">Afficher les cultures alternatives</Label>
              <Switch 
                id="showAlternatives" 
                checked={preferences.show_alternative_crops}
                onCheckedChange={(checked) => handlePreferenceChange('show_alternative_crops', checked)}
              />
            </div>
          </CardContent>
        </Card>
        <Card className="p-6">
          <CardTitle>Vos données</CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            {analysesCount !== null ? `${analysesCount} analyses sauvegardées` : 'Chargement...'}
          </p>
          <div className="mt-4 space-y-2">
            <Button variant="outline" className="w-full">Exporter toutes les données (CSV)</Button>
            <Button variant="destructive" className="w-full">Effacer tout l'historique</Button>
          </div>
        </Card>
        <Card className="p-6 text-sm text-muted-foreground space-y-2">
            <p className="font-semibold text-foreground">AgriSmart v1.0.0</p>
            <p>Powered by a Random Forest ML Model</p>
            <p>22 crop varieties supported</p>
        </Card>
      </div>
    </div>
  );
}

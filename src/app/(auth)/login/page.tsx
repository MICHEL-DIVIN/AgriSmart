"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Leaf, Mail, Lock, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    console.log("1. onSubmit appelé", data);
    setLoading(true);
    setError(null);
    try {
      console.log("2. Appel signIn...");
      const { error } = await signIn(data.email, data.password);
      
      if (error) {
        setError("Email ou mot de passe incorrect.");
        setLoading(false);
        return;
      }
      
      // LOGS TEMPORAIRES
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      console.log("USER APRES LOGIN:", user)
      console.log("USER ID:", user?.id)
      
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user?.id)
        .single()
      
      console.log("PROFILE:", profile)
      console.log("ROLE:", profile?.role)
      console.log("ERROR:", profileError)
      
      if (profile?.role === 'admin') {
        console.log("REDIRECT VERS /admin")
        window.location.href = '/admin'
      } else {
        console.log("REDIRECT VERS /")
        window.location.href = '/'
      }
      
    } catch (err) {
      console.log("ERREUR LOGIN:", err)
      setError("Email ou mot de passe incorrect.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="w-full max-w-[420px] bg-[#141414] border border-[#2a2a2a] rounded-2xl p-10"
    >
      <div className="flex flex-col items-center text-center">
        <Link href="/" className="flex items-center gap-2 mb-6">
          <Leaf className="h-7 w-7 text-primary" />
          <span className="text-2xl font-bold text-white">AgriSmart</span>
        </Link>
        <h1 className="text-lg font-semibold text-white mt-6" suppressHydrationWarning>Bon retour</h1>
        <p className="text-sm text-[#a3a3a3] mt-1" suppressHydrationWarning>Connectez-vous à votre compte</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit, (errors) => {
        console.log("Erreurs de validation:", errors);
      })} className="mt-8 space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-[#525252] text-xs uppercase tracking-widest">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#525252]" />
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              className="pl-9 h-12 text-sm"
              {...register('email')}
            />
          </div>
          {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password"  className="text-[#525252] text-xs uppercase tracking-widest">Mot de passe</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#525252]" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              className="pl-9 pr-10 h-12 text-sm"
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#525252] hover:text-white"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
        </div>
        
        <Button type="submit" disabled={loading} className="w-full h-12 text-[15px] bg-primary hover:bg-accent">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Se connecter'}
        </Button>
        {error && (
          <p className="text-red-500 text-sm text-center">
            {error}
          </p>
        )}
      </form>

      <p className="mt-8 text-center text-sm text-[#a3a3a3]">
        Pas encore de compte ?{' '}
        <Link href="/register" className="font-bold text-primary hover:underline">
          S'inscrire
        </Link>
      </p>
    </div>
  );
}

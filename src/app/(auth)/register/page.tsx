"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Leaf, Mail, Lock, Eye, EyeOff, User, Building, Globe, Phone, CheckCircle, XCircle, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { countries } from '@/lib/countries';

const passwordSchema = z.string().min(8, 'Password must be at least 8 characters');

const formSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  password: passwordSchema,
  confirmPassword: passwordSchema,
  role: z.string().min(1, 'Please select a role'),
  organization: z.string().min(1, 'Organization is required'),
  country: z.string().min(1, 'Please select a country'),
  phone: z.string().optional(),
  terms: z.literal(true, {
    errorMap: () => ({ message: 'You must accept the terms' }),
  }),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type FormValues = z.infer<typeof formSchema>;

const roles = [
  { value: 'farmer', label: 'Farmer', icon: '👨‍🌾' },
  { value: 'technician', label: 'Agricultural Technician' },
  { value: 'agronomist', label: 'Agronomist' },
  { value: 'researcher', label: 'Researcher' },
  { value: 'developer', label: 'Developer' },
];

export default function RegisterPage() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [firstName, setFirstName] = useState('');

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: '',
      organization: '',
      country: '',
      phone: '',
    },
  });

  const { register, handleSubmit, control, watch, trigger, formState: { errors } } = form;
  const password = watch('password');
  const confirmPassword = watch('confirmPassword');

  const getPasswordStrength = () => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++;
    if (password.match(/[0-9]/)) strength++;
    if (password.match(/[^a-zA-Z0-9]/)) strength++;
    return strength;
  };
  const passwordStrength = getPasswordStrength();

  const strength = {
    0: { label: '', color: '' },
    1: { label: 'Weak', color: 'bg-red-500 text-red-500' },
    2: { label: 'Fair', color: 'bg-orange-500 text-orange-500' },
    3: { label: 'Good', color: 'bg-yellow-500 text-yellow-500' },
    4: { label: 'Strong', color: 'bg-primary text-primary' },
  };

  const handleContinue = async () => {
    const isValid = await trigger(['fullName', 'email', 'password', 'confirmPassword']);
    if (isValid) {
      setStep(2);
    }
  };

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    setError(null);
    const { error } = await signUp(data.email, data.password, {
      full_name: data.fullName,
      role: data.role,
      organization: data.organization,
      country: data.country,
      phone: data.phone,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setFirstName(data.fullName.split(' ')[0]);
      setSuccess(true);
      setTimeout(() => router.push('/'), 2000);
    }
  };
  
  if (success) {
    return (
      <div className="w-full max-w-[480px] bg-[#141414] border border-[#2a2a2a] rounded-2xl p-10 flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Check className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-xl font-bold text-white mt-6">Compte créé !</h1>
        <p className="text-sm text-[#a3a3a3] mt-2">
          Bienvenue sur AgriSmart, {firstName}. Redirection vers votre tableau de bord...
        </p>
        <Loader2 className="mt-4 h-5 w-5 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-[480px] bg-[#141414] border border-[#2a2a2a] rounded-2xl p-10 my-10">
      <div className="flex flex-col items-center text-center">
        <Link href="/" className="flex items-center gap-2 mb-6">
          <Leaf className="h-7 w-7 text-primary" />
          <span className="text-2xl font-bold text-white">AgriSmart</span>
        </Link>
        <h1 className="text-lg font-semibold text-white mt-6">Créer un compte</h1>
        <p className="text-sm text-[#a3a3a3] mt-1">Commencez à optimiser vos recommandations de cultures</p>
      </div>

      <div className="mt-8 flex items-center justify-center gap-2">
        <div className={cn("px-3 py-1 text-xs rounded-full", step === 1 ? "bg-primary text-white" : "bg-secondary text-muted-foreground border border-border")}>Étape 1 : Compte</div>
        <div className="h-px w-8 bg-border"></div>
        <div className={cn("px-3 py-1 text-xs rounded-full", step === 2 ? "bg-primary text-white" : "bg-secondary text-muted-foreground border border-border")}>Étape 2 : Profil</div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
        {step === 1 && (
          <>
            <div className="space-y-2">
              <Label className="text-muted text-xs uppercase tracking-wider">Nom complet</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                <Input placeholder="Votre nom complet" className="pl-9" {...register('fullName')} />
              </div>
              {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label className="text-muted text-xs uppercase tracking-wider">Adresse email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                <Input type="email" placeholder="you@example.com" className="pl-9" {...register('email')} />
              </div>
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label className="text-muted text-xs uppercase tracking-wider">Mot de passe</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                <Input type={showPassword ? 'text' : 'password'} placeholder="••••••••" className="pl-9" {...register('password')} />
                 <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {password && (
                <div className="flex items-center justify-between mt-1">
                    <div className="flex-1 flex gap-1 h-1">
                        {Array.from({length: 4}).map((_, i) => (
                           <div key={i} className={cn("flex-1 rounded-full", i < passwordStrength ? strength[passwordStrength as keyof typeof strength].color.split(' ')[0] : 'bg-border')}></div>
                        ))}
                    </div>
                    <span className={cn("text-xs ml-2", strength[passwordStrength as keyof typeof strength].color.split(' ')[1])}>{strength[passwordStrength as keyof typeof strength].label}</span>
                </div>
              )}
               {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
            </div>
            <div className="space-y-2">
              <Label className="text-muted text-xs uppercase tracking-wider">Confirmer le mot de passe</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                <Input type={showConfirmPassword ? 'text' : 'password'} placeholder="••••••••" className="pl-9" {...register('confirmPassword')} />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-10 top-1/2 -translate-y-1/2 text-muted hover:text-white">
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                {confirmPassword && password && (
                  password === confirmPassword ?
                  <CheckCircle size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-primary" /> :
                  <XCircle size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-destructive" />
                )}
              </div>
              {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword.message}</p>}
            </div>
            <Button type="button" onClick={handleContinue} className="w-full h-12">Continuer</Button>
          </>
        )}
        {step === 2 && (
          <>
            <div className="space-y-2">
                <Label className="text-muted text-xs uppercase tracking-wider">Votre rôle</Label>
                <Select onValueChange={(value) => form.setValue('role', value)}>
                    <SelectTrigger className="h-12">
                        <SelectValue placeholder="Select a role..." />
                    </SelectTrigger>
                    <SelectContent>
                        {roles.map(role => (
                            <SelectItem key={role.value} value={role.value}>
                                <div className="flex items-center gap-2">
                                    {role.icon && <span>{role.icon}</span>}
                                    {role.label}
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {errors.role && <p className="text-xs text-red-500 mt-1">{errors.role.message}</p>}
            </div>
            <div className="space-y-2">
              <Label className="text-muted text-xs uppercase tracking-wider">Organisation / Nom de la ferme</Label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                <Input placeholder="e.g. Green Valley Farm" className="pl-9" {...register('organization')} />
              </div>
              {errors.organization && <p className="text-xs text-red-500 mt-1">{errors.organization.message}</p>}
            </div>
             <div className="space-y-2">
                <Label className="text-muted text-xs uppercase tracking-wider">Pays</Label>
                <Select onValueChange={(value) => form.setValue('country', value)}>
                    <SelectTrigger className="h-12 pl-9">
                         <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                        <SelectValue placeholder="Select your country..." />
                    </SelectTrigger>
                    <SelectContent>
                        {Object.entries(countries).map(([code, country]) => (
                            <SelectItem key={code} value={country.name}>{country.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                 {errors.country && <p className="text-xs text-red-500 mt-1">{errors.country.message}</p>}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-muted text-xs uppercase tracking-wider">Téléphone</Label>
                <span className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded-full">Optional</span>
              </div>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                <Input type="tel" placeholder="+1 (555) 123-4567" className="pl-9" {...register('phone')} />
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <Checkbox id="terms" className="mt-0.5" onCheckedChange={checked => form.setValue('terms', checked as boolean)} />
              <div className="grid gap-1.5 leading-none">
                <label htmlFor="terms" className="text-xs text-muted-foreground">
                  I agree to the{' '}
                  <Link href="/terms" className="text-primary hover:underline">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="text-primary hover:underline">
                    Privacy Policy
                  </Link>
                  .
                </label>
                 {errors.terms && <p className="text-xs text-red-500">{errors.terms.message}</p>}
              </div>
            </div>
            
            {error && <p className="text-sm text-red-500">{error}</p>}
            
            <Button type="submit" disabled={loading} className="w-full h-12">
              {loading ? <Loader2 className="animate-spin" /> : 'Créer un compte'}
            </Button>
            <button type="button" onClick={() => setStep(1)} className="w-full text-center text-xs text-muted-foreground hover:text-white">
              ← Retour à l'étape 1
            </button>
          </>
        )}
      </form>
      
      <p className="mt-8 text-center text-sm text-[#a3a3a3]">
        Déjà un compte ?{' '}
        <Link href="/login" className="font-bold text-primary hover:underline">
          Se connecter
        </Link>
      </p>
    </div>
  );
}

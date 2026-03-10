"use client";

import { useState, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';

const formSchema = z.object({
  nitrogen: z.coerce.number().min(0, "Must be positive"),
  phosphorus: z.coerce.number().min(0, "Must be positive"),
  potassium: z.coerce.number().min(0, "Must be positive"),
  temperature: z.coerce.number(),
  humidity: z.coerce.number().min(0).max(100, "Must be between 0 and 100"),
  ph: z.coerce.number().min(0).max(14, "Must be between 0 and 14"),
  rainfall: z.coerce.number().min(0, "Must be positive"),
});

type FormValues = z.infer<typeof formSchema>;

interface InputFieldProps {
  name: keyof FormValues;
  label: string;
  placeholder: string;
  unit: string;
  control: any;
  type?: string;
  step?: string;
}

const InputField = ({ name, label, placeholder, unit, control, type = "number", step }: InputFieldProps) => (
  <FormField
    control={control}
    name={name}
    render={({ field }) => (
      <FormItem>
        <FormLabel className="text-muted text-xs uppercase tracking-wider">{label}</FormLabel>
        <div className="relative">
          <FormControl>
            <Input type={type} placeholder={placeholder} {...field} step={step} />
          </FormControl>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <span className="rounded-md bg-border px-2 py-1 text-xs text-muted-foreground">{unit}</span>
          </div>
        </div>
        <FormMessage />
      </FormItem>
    )}
  />
);


const PhScale = ({ value }: { value: number }) => {
  const percentage = (value / 14) * 100;
  return (
    <div className="mt-2">
      <div className="h-2 w-full rounded-full bg-gradient-to-r from-red-500 via-green-500 to-red-500 relative">
        <div 
          className="absolute top-1/2 h-4 w-1 -translate-x-1/2 -translate-y-1/2 transform rounded-full bg-white border border-gray-300" 
          style={{ left: `${percentage}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground mt-1">
        <span>0</span>
        <span>7</span>
        <span>14</span>
      </div>
    </div>
  );
};

export function AnalysisForm({ onAnalyze, isAnalyzing }: { onAnalyze: (data: FormValues) => void; isAnalyzing: boolean; }) {
  const { user, loading: authLoading } = useAuth();
  const [defaultValues, setDefaultValues] = useState({
    nitrogen: 85,
    phosphorus: 42,
    potassium: 210,
    temperature: 24.5,
    humidity: 72,
    ph: 6.4,
    rainfall: 180,
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues,
  });

  useEffect(() => {
    const fetchLastAnalysis = async () => {
      if (authLoading || !user) return;

      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('analyses')
          .select('n, p, k, temperature, humidity, ph, rainfall')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (!error && data) {
          const newDefaults = {
            nitrogen: data.n,
            phosphorus: data.p,
            potassium: data.k,
            temperature: data.temperature,
            humidity: data.humidity,
            ph: data.ph,
            rainfall: data.rainfall,
          };
          setDefaultValues(newDefaults);
          // Reset form with new default values
          form.reset(newDefaults);
        }
      } catch (error) {
        console.error('Error fetching last analysis:', error);
      }
    };

    fetchLastAnalysis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    onAnalyze(data);
  };
  
  const phValue = form.watch('ph');

  return (
    <Card className="p-0">
      <CardHeader className="p-6">
        <CardTitle>Paramètres du sol</CardTitle>
        <CardDescription>Saisissez vos données de sol et climat ci-dessous.</CardDescription>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <InputField name="nitrogen" label="Azote (N)" placeholder="ex. 85" unit="mg/kg" control={form.control} />
              <InputField name="phosphorus" label="Phosphore (P)" placeholder="ex. 42" unit="mg/kg" control={form.control} />
              <InputField name="potassium" label="Potassium (K)" placeholder="ex. 210" unit="mg/kg" control={form.control} />
              <InputField name="temperature" label="Température" placeholder="ex. 24.5" unit="°C" control={form.control} step="0.1" />
              <InputField name="humidity" label="Humidité" placeholder="ex. 72" unit="%" control={form.control} />
              <FormField
                control={form.control}
                name="ph"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-muted text-xs uppercase tracking-wider">Niveau de pH</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input type="number" placeholder="ex. 6.4" {...field} step="0.1" />
                      </FormControl>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                        <span className="rounded-md bg-border px-2 py-1 text-xs text-muted-foreground">pH</span>
                      </div>
                    </div>
                    <PhScale value={phValue || 0} />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <InputField name="rainfall" label="Pluviométrie" placeholder="ex. 180" unit="mm" control={form.control} />
            <Button type="submit" className="w-full" disabled={isAnalyzing}>
              {isAnalyzing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Analyser
            </Button>
            <p className="text-center text-xs text-muted">Les résultats apparaîtront à droite →</p>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

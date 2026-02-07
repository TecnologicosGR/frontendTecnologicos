import React from 'react';
import LoginForm from '../components/LoginForm';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../../components/ui/card';
import { ShoppingBag } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <Card className="w-full max-w-sm shadow-lg border-2">
        <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
                <div className="p-4 bg-primary rounded-xl shadow-md">
                    <ShoppingBag className="w-10 h-10 text-primary-foreground" />
                </div>
            </div>
          <div>
            <CardTitle className="text-2xl font-bold tracking-tight">Tecnológicos GR</CardTitle>
            <CardDescription className="text-base mt-2">
                Panel Administrativo
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
        <CardFooter className="flex justify-center">
            <p className="text-xs text-muted-foreground text-center">
                &copy; 2024 Tecnológicos GR. Todos los derechos reservados.
            </p>
        </CardFooter>
      </Card>
    </div>
  );
}

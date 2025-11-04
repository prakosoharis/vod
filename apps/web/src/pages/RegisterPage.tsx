import { Link } from 'react-router-dom';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function RegisterPage() {
  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Create Account</CardTitle>
          <CardDescription>Sign up to start streaming your favorite content</CardDescription>
        </CardHeader>
        <CardContent>
          <RegisterForm />
          <div className="mt-4 text-center text-sm">
            <span className="text-muted-foreground">Already have an account? </span>
            <Link to="/login" className="text-primary hover:underline">
              Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}



import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import AwStarlightLogo from '@/components/AwStarlightLogo';
import { toast } from '@/hooks/use-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  // Redirect if already authenticated
  if (isAuthenticated) {
    navigate('/');
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError('');

    try {
      const { error } = await login(email, password);
      
      if (error) {
        setError(error.message || 'Login failed');
      } else {
        toast({ title: "Success", description: "Logged in successfully" });
        navigate('/');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: 'hsl(36, 20%, 97%)' }}>
      {/* Left panel — branding */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-14 border-r"
        style={{ backgroundColor: 'hsl(36, 24%, 95%)', borderColor: 'hsl(220, 14%, 88%)' }}
      >
        <div>
          <AwStarlightLogo variant="dark" className="w-56" />
        </div>

        <div>
          <p className="text-xs tracking-widest uppercase font-semibold mb-4" style={{ color: 'hsl(34, 32%, 48%)' }}>Inspection Management</p>
          <h1 className="text-4xl font-light leading-snug mb-6" style={{ fontFamily: "'Lora', serif", color: 'hsl(215, 44%, 18%)' }}>
            Built to higher<br />
            <em>standards.</em>
          </h1>
          <p className="text-sm leading-relaxed max-w-xs" style={{ color: 'hsl(220, 12%, 46%)' }}>
            Professional-grade audit and inspection management aligned with IBACOS building science standards.
          </p>
        </div>

        <p className="text-xs tracking-wider" style={{ color: 'hsl(220, 12%, 58%)' }}>© {new Date().getFullYear()} IbacosIQ · ibacosiq.com</p>
      </div>

      {/* Right panel — login form */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        {/* Mobile logo */}
        <div className="flex lg:hidden mb-10">
          <AwStarlightLogo variant="dark" className="w-44" />
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-1" style={{ color: 'hsl(220, 30%, 12%)' }}>Sign In</h2>
            <p className="text-sm" style={{ color: 'hsl(220, 12%, 46%)' }}>Access your inspection dashboard</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <Label htmlFor="email" className="text-xs font-semibold tracking-widest uppercase mb-1.5 block" style={{ color: 'hsl(220, 30%, 12%)' }}>
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="h-11 rounded-sm border-0 border-b-2 bg-transparent focus-visible:ring-0 focus-visible:border-b-2 px-0"
                style={{ borderColor: 'hsl(220, 14%, 78%)', borderBottomColor: 'hsl(220, 14%, 78%)' }}
                placeholder="your@email.com"
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-xs font-semibold tracking-widest uppercase mb-1.5 block" style={{ color: 'hsl(220, 30%, 12%)' }}>
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="h-11 rounded-sm border-0 border-b-2 bg-transparent focus-visible:ring-0 px-0"
                style={{ borderColor: 'hsl(220, 14%, 78%)' }}
                placeholder="••••••••"
              />
            </div>

            {error && (
              <Alert variant="destructive" className="rounded-sm">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="pt-2">
              <Button
                type="submit"
                className="w-full h-11 rounded-sm text-xs font-semibold tracking-widest uppercase transition-opacity hover:opacity-90"
                style={{ backgroundColor: 'hsl(215, 44%, 18%)', color: 'white' }}
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign In
              </Button>
            </div>
          </form>

          <p className="mt-8 text-center text-xs tracking-wide" style={{ color: 'hsl(220, 12%, 56%)' }}>
            Need access? Contact your administrator.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

import {
  createFileRoute,
  Link,
  useRouter,
  useSearch,
} from "@tanstack/react-router";
import { FilmIcon, LockIcon, MailIcon, UserIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

// Define search params interface
interface SignupSearchParams {
  redirectTo?: string;
}

export const Route = createFileRoute("/signup")({
  component: SignupComponent,
});

function SignupComponent() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({
    email: "",
    displayName: "",
    password: "",
    confirmPassword: "",
  });

  const router = useRouter();
  const { redirectTo } = useSearch({ from: "/signup" }) as SignupSearchParams;

  // Validate form
  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      email: "",
      displayName: "",
      password: "",
      confirmPassword: "",
    };

    // Email validation
    if (!email) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email address";
      isValid = false;
    }

    // Display name validation
    if (!displayName) {
      newErrors.displayName = "Display name is required";
      isValid = false;
    }

    // Password validation
    if (!password) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      isValid = false;
    }

    // Confirm password validation
    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
      isValid = false;
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Use the signup function from AuthClient
      await authClient.signUp.email({
        email,
        password,
        name: displayName,
      });

      toast.success("Account created successfully!");

      // Navigate to the login page or redirect URL
      router.navigate({ to: "/login", search: { redirectTo } });
    } catch (error) {
      toast.error("Failed to create account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md px-4">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="rounded-full bg-primary/10 p-4 mb-4">
            <FilmIcon size={32} className="text-primary" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            RecSha
          </h2>
          <p className="mt-2 text-muted-foreground">
            Create a new account to get started
          </p>
        </div>

        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-2xl text-foreground">Sign Up</CardTitle>
            <CardDescription className="text-muted-foreground">
              Enter your details to create your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">
                  Email
                </Label>
                <div className="relative">
                  <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    placeholder="you@example.com"
                    className="pl-10 bg-background border-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="displayName" className="text-foreground">
                  Display Name
                </Label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="displayName"
                    placeholder="Your name"
                    className="pl-10 bg-background border-input"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                {errors.displayName && (
                  <p className="text-sm text-destructive">
                    {errors.displayName}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">
                  Password
                </Label>
                <div className="relative">
                  <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••"
                    className="pl-10 bg-background border-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-foreground">
                  Confirm Password
                </Label>
                <div className="relative">
                  <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••"
                    className="pl-10 bg-background border-input"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-primary-foreground"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Creating account...
                  </div>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 border-t border-border pt-6">
            <div className="text-center text-sm text-muted-foreground">
              <span>Already have an account? </span>
              <Link
                to="/login"
                className="font-medium text-primary hover:text-primary/80 underline-offset-4 hover:underline"
              >
                Sign in
              </Link>
            </div>
            <div className="text-center text-xs text-muted-foreground">
              By continuing, you agree to our Terms of Service and Privacy
              Policy
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

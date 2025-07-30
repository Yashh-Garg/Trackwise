import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useLoginMutation, useGoogleAuthMutation } from "@/hooks/use-auth";
import { signInSchema } from "@/lib/schema";
import { useAuth } from "@/provider/auth-context";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import { z } from "zod";
import { useState, useEffect } from "react";
import { GoogleLogin, useGoogleLogin } from "@react-oauth/google";

type SigninFormData = z.infer<typeof signInSchema>;

const SignIn = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth(); // Get the login function from auth context

  const form = useForm<SigninFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { mutate, isPending } = useLoginMutation();
  const { mutate: googleMutate, isPending: isGooglePending } = useGoogleAuthMutation();

  // Disable Google One Tap when component mounts
  useEffect(() => {
    // Function to disable One Tap
    const disableOneTap = () => {
      if (window.google && window.google.accounts && window.google.accounts.id) {
        window.google.accounts.id.cancel();
        window.google.accounts.id.disableAutoSelect();
      }
      
      // Hide any existing One Tap prompts
      const oneTapElements = document.querySelectorAll('[data-testid="google-one-tap"], .g_id_signin, #credential_picker_container, [id^="credential_picker"]');
      oneTapElements.forEach(el => {
        el.style.display = 'none';
        el.remove();
      });
    };

    // Run immediately
    disableOneTap();
    
    // Run after a short delay to catch any delayed One Tap initialization
    const timeoutId = setTimeout(disableOneTap, 100);
    
    // Set up a mutation observer to catch any dynamically added One Tap elements
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) { // Element node
            const element = node as Element;
            if (element.matches && (
              element.matches('[data-testid="google-one-tap"]') ||
              element.matches('.g_id_signin') ||
              element.matches('#credential_picker_container') ||
              element.matches('[id^="credential_picker"]')
            )) {
              element.remove();
            }
          }
        });
      });
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
    
    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, []);

  const handleOnSubmit = (values: SigninFormData) => {
    mutate(values, {
      onSuccess: (data) => {
        login(data);
        console.log(data);
        toast.success("Login successful");
        navigate("/dashboard");
      },
      onError: (error: any) => {
        const errorMessage =
          error.response?.data?.message || "An error occurred";
        console.log(error);
        toast.error(errorMessage);
      },
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleGoogleSuccess = (credentialResponse: any) => {
    if (credentialResponse.credential) {
      googleMutate(
        { token: credentialResponse.credential },
        {
          onSuccess: (data) => {
            login(data);
            toast.success("Google sign-in successful");
            navigate("/dashboard");
          },
          onError: (error: any) => {
            const errorMessage =
              error.response?.data?.message || "Google sign-in failed";
            toast.error(errorMessage);
          },
        }
      );
    }
  };

  const login1 = useGoogleLogin({
    onSuccess: (credentialResponse) => {
      if (credentialResponse.credential) {
        googleMutate(
          { token: credentialResponse.credential },
          {
            onSuccess: (data) => {
              login(data);
              toast.success("Google sign-in successful");
              navigate("/dashboard");
            },
            onError: (error: any) => {
              const errorMessage =
                error.response?.data?.message || "Google sign-in failed";
              toast.error(errorMessage);
            },
          }
        );
      }
    },
    onError: () => {
      toast.error("Google sign-in failed");
    },
  })

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/40 p-4">
      <Card className="max-w-md w-full shadow-xl">
        <CardHeader className="text-center mb-5">
          <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Sign in to your account to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleOnSubmit)}
              className="space-y-6"
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Password</FormLabel>
                      <Link
                        to="/forgot-password"
                        className="text-sm text-blue-600"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="********"
                          {...field}
                          className="pr-10"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                          onClick={togglePasswordVisibility}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? "Signing in..." : "Sign in"}
              </Button>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>
              <div id="google-signin-button">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => {
                    toast.error("Google sign-in failed");
                  }}
                  flow="auth-code"
                  text="signin_with"
                  shape="rectangular"
                  size="large"
                  width="384"
                  disabled={isGooglePending}
                  useOneTap={false}
                  auto_select={false}
                  cancel_on_tap_outside={true}
                  prompt_parent_id="google-signin-button"
                />
              </div>

              {isGooglePending && (
                <div className="flex items-center justify-center mt-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="ml-2 text-sm">Signing in with Google...</span>
                </div>
              )}
            </form>
          </Form>

          <CardFooter className="flex items-center justify-center mt-6">
            <div className="flex items-center justify-center">
              <p className="text-sm text-muted-foreground">
                Don&apos;t have an account? <Link to="/sign-up" className="text-blue-500">Sign up</Link>
              </p>
            </div>
          </CardFooter>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignIn;
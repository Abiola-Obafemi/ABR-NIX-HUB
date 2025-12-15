import React, { useState } from 'react';
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, googleProvider } from '../services/firebase';
import { Crown, Mail, ArrowRight, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Helper to format Firebase errors into human instructions
  const handleFirebaseError = (err: any) => {
    console.error("Auth Error:", err);
    const code = err.code;
    const msg = err.message;

    if (code === 'auth/unauthorized-domain') {
      setError("DOMAIN ERROR: Go to Firebase Console -> Authentication -> Settings -> Authorized Domains and add this website's domain.");
    } else if (code === 'auth/operation-not-allowed') {
      setError("CONFIG ERROR: Go to Firebase Console -> Authentication -> Sign-in method and enable Google/Email providers.");
    } else if (code === 'auth/popup-closed-by-user') {
      setError("Sign in cancelled.");
    } else if (code === 'auth/email-already-in-use') {
      setError("That email is already registered. Try signing in.");
    } else if (code === 'auth/wrong-password' || code === 'auth/user-not-found' || code === 'auth/invalid-credential') {
      setError("Invalid email or password.");
    } else {
      setError(msg || "Authentication Failed. Check console for details.");
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      await signInWithPopup(auth, googleProvider);
      // Navigation is handled by UserContext state change, but we can force it
      navigate('/');
    } catch (err: any) {
      handleFirebaseError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      navigate('/');
    } catch (err: any) {
      handleFirebaseError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-red-900/10 rounded-full blur-[120px]"></div>
      </div>

      <div className="w-full max-w-md bg-neutral-900/80 backdrop-blur-xl border border-neutral-800 rounded-2xl p-8 shadow-2xl animate-in fade-in zoom-in duration-300">
        <div className="flex flex-col items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-800 rounded-lg flex items-center justify-center shadow-lg transform -rotate-3">
                 <Crown className="w-8 h-8 text-white" fill="currentColor" />
            </div>
            <h1 className="text-3xl font-bold text-white brand-font">ABRØNIX HUB</h1>
            <p className="text-neutral-400 text-sm text-center">
              Sign in to save your stats, routines, and game plans to the cloud forever.
            </p>
        </div>

        {error && (
            <div className="mb-6 bg-red-900/20 border border-red-900/50 p-4 rounded-lg flex items-start gap-3 text-sm text-red-200">
                <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <span className="font-medium">{error}</span>
            </div>
        )}

        <button 
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full bg-white text-black font-bold py-3 rounded-lg hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2 mb-6"
        >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="G" />
            Sign in with Google
        </button>

        <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-800"></div>
            </div>
            <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-neutral-900 text-neutral-500">Or continue with email</span>
            </div>
        </div>

        <form onSubmit={handleEmailAuth} className="space-y-4">
            <div>
                <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">Email Address</label>
                <div className="relative">
                    <Mail className="absolute left-3 top-3.5 w-4 h-4 text-neutral-600" />
                    <input 
                        type="email" 
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full bg-black border border-neutral-800 rounded-lg py-3 pl-10 pr-4 text-white focus:border-red-600 outline-none"
                        placeholder="pro@example.com"
                    />
                </div>
            </div>
             <div>
                <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">Password</label>
                <input 
                    type="password" 
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-black border border-neutral-800 rounded-lg py-3 px-4 text-white focus:border-red-600 outline-none"
                    placeholder="••••••••"
                />
            </div>

            <button 
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg shadow-lg shadow-red-600/20 transition-all flex items-center justify-center gap-2 mt-4"
            >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                    <>
                        {isSignUp ? 'CREATE ACCOUNT' : 'SIGN IN'}
                        <ArrowRight className="w-4 h-4" />
                    </>
                )}
            </button>
        </form>

        <div className="mt-6 text-center space-y-4">
            <button 
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-sm text-neutral-400 hover:text-white transition-colors"
            >
                {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </button>
            
            <div className="pt-4 border-t border-neutral-800">
                <button onClick={() => navigate('/welcome')} className="text-xs text-neutral-600 hover:text-neutral-400 underline">
                    Continue as Guest (Data lost if cache cleared)
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
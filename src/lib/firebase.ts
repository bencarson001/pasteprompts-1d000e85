import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithRedirect, 
  signInWithCredential, 
  signOut as firebaseSignOut, 
  User
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";

interface GISCallbackResponse {
  error?: unknown;
  access_token?: string;
  id_token?: string;
}

declare global {
  interface Window {
    google?: {
      accounts?: {
        oauth2?: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: GISCallbackResponse) => void;
          }) => { requestAccessToken: () => void };
        };
      };
    };
  }
}

const fbConfig = firebaseConfig as typeof firebaseConfig & { firestoreDatabaseId?: string };

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = fbConfig.firestoreDatabaseId
  ? getFirestore(app, fbConfig.firestoreDatabaseId)
  : getFirestore(app);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export const signInWithGoogleFirebase = async (): Promise<User | null> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (err: unknown) {
    const error = err as { code?: string; message?: string };
    console.warn("Firebase popup sign-in attempt:", error);
    
    if (error?.code === "auth/popup-closed-by-user" || error?.code === "auth/cancelled-popup-request") {
      return null;
    }
    
    if (error?.code === "auth/popup-blocked") {
      try {
        await signInWithRedirect(auth, googleProvider);
        return null;
      } catch {
        throw new Error("Sign-in popup was blocked by your browser. Please allow popups for this site or sign in with email.");
      }
    }
    
    if (error?.code === "auth/unauthorized-domain") {
      throw new Error("This preview domain is not registered in Firebase Auth. Please sign in with email/password or use the live domain.");
    }
    
    throw new Error(error?.message || "Google Sign-In failed. Please try again or use email sign-in.");
  }
};

export const logoutFirebase = async () => {
  await firebaseSignOut(auth);
};

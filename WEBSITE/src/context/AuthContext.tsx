import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type AuthUser = {
  userId: string;
  fullName: string;
  email: string;
  createdAt: string;
  lastLoginAt?: string | null;
};

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    fullName: string,
    email: string,
    password: string,
  ) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
};

type AuthProviderProps = {
  children: React.ReactNode;
};

type AuthResponsePayload = {
  token: string;
  user: AuthUser;
  message?: string;
};

const authTokenStorageKey = "lwg_auth_token";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function getBackendBaseUrl() {
  const configured = import.meta.env.VITE_BACKEND_BASE_URL;
  if (!configured) {
    return "/backend";
  }

  return configured.replace(/\/+$/, "");
}

const backendBaseUrl = getBackendBaseUrl();

function parseErrorMessage(payload: unknown, fallback: string) {
  if (
    payload &&
    typeof payload === "object" &&
    "message" in payload &&
    typeof payload.message === "string"
  ) {
    return payload.message;
  }

  return fallback;
}

async function readJsonSafely(response: Response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const persistToken = useCallback((nextToken: string | null) => {
    setToken(nextToken);
    if (nextToken) {
      localStorage.setItem(authTokenStorageKey, nextToken);
      return;
    }

    localStorage.removeItem(authTokenStorageKey);
  }, []);

  const applyAuthResponse = useCallback(
    (payload: AuthResponsePayload) => {
      persistToken(payload.token);
      setUser(payload.user);
    },
    [persistToken],
  );

  const logout = useCallback(() => {
    persistToken(null);
    setUser(null);
  }, [persistToken]);

  const refreshUser = useCallback(async () => {
    const activeToken = localStorage.getItem(authTokenStorageKey);
    if (!activeToken) {
      logout();
      return;
    }

    const response = await fetch(`${backendBaseUrl}/auth/me`, {
      headers: {
        Authorization: `Bearer ${activeToken}`,
      },
    });

    if (!response.ok) {
      logout();
      return;
    }

    const payload = await readJsonSafely(response);
    if (
      payload &&
      typeof payload === "object" &&
      "user" in payload &&
      payload.user &&
      typeof payload.user === "object"
    ) {
      setToken(activeToken);
      setUser(payload.user as AuthUser);
      return;
    }

    logout();
  }, [logout]);

  const register = useCallback(
    async (fullName: string, email: string, password: string) => {
      const response = await fetch(`${backendBaseUrl}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName,
          email,
          password,
        }),
      });

      const payload = await readJsonSafely(response);
      if (!response.ok) {
        throw new Error(
          parseErrorMessage(payload, "Регистрацията е неуспешна"),
        );
      }

      if (
        !payload ||
        typeof payload !== "object" ||
        !("token" in payload) ||
        !("user" in payload)
      ) {
        throw new Error("Невалиден отговор от сървъра");
      }

      applyAuthResponse(payload as AuthResponsePayload);
    },
    [applyAuthResponse],
  );

  const login = useCallback(
    async (email: string, password: string) => {
      const response = await fetch(`${backendBaseUrl}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const payload = await readJsonSafely(response);
      if (!response.ok) {
        throw new Error(parseErrorMessage(payload, "Входът е неуспешен"));
      }

      if (
        !payload ||
        typeof payload !== "object" ||
        !("token" in payload) ||
        !("user" in payload)
      ) {
        throw new Error("Невалиден отговор от сървъра");
      }

      applyAuthResponse(payload as AuthResponsePayload);
    },
    [applyAuthResponse],
  );

  useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      try {
        await refreshUser();
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initialize();

    return () => {
      isMounted = false;
    };
  }, [refreshUser]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(user && token),
      isLoading,
      login,
      register,
      logout,
      refreshUser,
    }),
    [user, token, isLoading, login, register, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}

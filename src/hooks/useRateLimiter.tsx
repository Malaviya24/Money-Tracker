import { useState, useCallback, useEffect } from "react";

interface RateLimitState {
  attempts: number;
  lockoutUntil: number | null;
  lastAttemptTime: number;
}

interface UseRateLimiterOptions {
  maxAttempts?: number;
  lockoutDuration?: number; // in milliseconds
  windowDuration?: number; // time window for counting attempts
  storageKey?: string;
}

interface UseRateLimiterReturn {
  isLocked: boolean;
  remainingAttempts: number;
  lockoutTimeRemaining: number; // in seconds
  recordAttempt: (success: boolean) => void;
  reset: () => void;
}

const DEFAULT_OPTIONS: Required<UseRateLimiterOptions> = {
  maxAttempts: 5,
  lockoutDuration: 5 * 60 * 1000, // 5 minutes
  windowDuration: 15 * 60 * 1000, // 15 minutes
  storageKey: "auth_rate_limit",
};

export function useRateLimiter(options: UseRateLimiterOptions = {}): UseRateLimiterReturn {
  const config = { ...DEFAULT_OPTIONS, ...options };
  
  const getStoredState = useCallback((): RateLimitState => {
    try {
      const stored = sessionStorage.getItem(config.storageKey);
      if (stored) {
        const state = JSON.parse(stored) as RateLimitState;
        // Clean up old attempts outside the window
        const now = Date.now();
        if (state.lastAttemptTime && now - state.lastAttemptTime > config.windowDuration) {
          return { attempts: 0, lockoutUntil: null, lastAttemptTime: 0 };
        }
        return state;
      }
    } catch {
      // Ignore storage errors
    }
    return { attempts: 0, lockoutUntil: null, lastAttemptTime: 0 };
  }, [config.storageKey, config.windowDuration]);

  const [state, setState] = useState<RateLimitState>(getStoredState);
  const [lockoutTimeRemaining, setLockoutTimeRemaining] = useState(0);

  // Persist state to sessionStorage
  const persistState = useCallback((newState: RateLimitState) => {
    try {
      sessionStorage.setItem(config.storageKey, JSON.stringify(newState));
    } catch {
      // Ignore storage errors
    }
    setState(newState);
  }, [config.storageKey]);

  // Calculate if currently locked
  const isLocked = state.lockoutUntil !== null && Date.now() < state.lockoutUntil;

  // Calculate remaining attempts
  const remainingAttempts = Math.max(0, config.maxAttempts - state.attempts);

  // Update lockout timer
  useEffect(() => {
    if (!state.lockoutUntil) {
      setLockoutTimeRemaining(0);
      return;
    }

    const updateTimer = () => {
      const remaining = Math.max(0, state.lockoutUntil! - Date.now());
      setLockoutTimeRemaining(Math.ceil(remaining / 1000));
      
      // Clear lockout when time expires
      if (remaining <= 0) {
        persistState({ ...state, lockoutUntil: null, attempts: 0 });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [state.lockoutUntil, persistState, state]);

  // Record an attempt
  const recordAttempt = useCallback((success: boolean) => {
    const now = Date.now();
    
    if (success) {
      // Reset on success
      persistState({ attempts: 0, lockoutUntil: null, lastAttemptTime: 0 });
      return;
    }

    // Failed attempt
    const newAttempts = state.attempts + 1;
    
    if (newAttempts >= config.maxAttempts) {
      // Apply exponential backoff: base lockout * 2^(excess attempts)
      const excessAttempts = Math.max(0, newAttempts - config.maxAttempts);
      const lockoutMultiplier = Math.pow(2, excessAttempts);
      const lockoutDuration = Math.min(
        config.lockoutDuration * lockoutMultiplier,
        30 * 60 * 1000 // Max 30 minutes
      );
      
      persistState({
        attempts: newAttempts,
        lockoutUntil: now + lockoutDuration,
        lastAttemptTime: now,
      });
    } else {
      persistState({
        attempts: newAttempts,
        lockoutUntil: null,
        lastAttemptTime: now,
      });
    }
  }, [state.attempts, config.maxAttempts, config.lockoutDuration, persistState]);

  // Reset rate limiter
  const reset = useCallback(() => {
    persistState({ attempts: 0, lockoutUntil: null, lastAttemptTime: 0 });
  }, [persistState]);

  return {
    isLocked,
    remainingAttempts,
    lockoutTimeRemaining,
    recordAttempt,
    reset,
  };
}

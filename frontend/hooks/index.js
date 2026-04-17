/**
 * Custom Hooks
 * Reusable state management and side-effect logic
 */

/**
 * useLocalStorage - Persist state in localStorage
 */
export function createLocalStorage(key, initialValue) {
  const readValue = () => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  };

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(readValue()) : value;
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
      window.dispatchEvent(new Event('local-storage'));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [readValue(), setValue];
}

/**
 * useDebounce - Debounce value changes
 */
// Debounce function (vanilla)
export function debounce(fn, delay = 500) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}

/**
 * useMediaQuery - Responsive media query hook
 */
export function getMediaQuery(query) {
  return window.matchMedia(query).matches;
}

export function watchMediaQuery(query, callback) {
  const media = window.matchMedia(query);
  const handler = () => callback(media.matches);
  media.addEventListener('change', handler);
  return () => media.removeEventListener('change', handler);
}

/**
 * useFetch - Data fetching hook
 */
// Fetch function (vanilla)
export async function fetchData(url, options = {}) {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (e) {
    throw new Error(e.message);
  }
}

/**
 * useForm - Form state management hook
 */
export function useForm(initialValues = {}, validationSchema = {}) {
  const [values, setValues] = React.useState(initialValues);
  const [errors, setErrors] = React.useState({});
  const [touched, setTouched] = React.useState({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;

    setValues(prev => ({ ...prev, [name]: val }));

    // Validate on change if field was touched
    if (touched[name] && validationSchema[name]) {
      validateField(name, val);
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));

    if (validationSchema[name]) {
      validateField(name, value);
    }
  };

  const validateField = (name, value) => {
    const validator = validationSchema[name];
    if (validator) {
      const error = validator(value, values);
      setErrors(prev => ({ ...prev, [name]: error }));
      return !error;
    }
    return true;
  };

  const validate = () => {
    let isValid = true;
    const newErrors = {};

    Object.keys(validationSchema).forEach(field => {
      const error = validationSchema[field](values[field], values);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (onSubmit) => {
    setIsSubmitting(true);

    if (validate()) {
      try {
        await onSubmit(values);
      } catch (e) {
        console.error('Form submission error:', e);
      }
    }

    setIsSubmitting(false);
  };

  const reset = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  };

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    validate,
    reset,
    setValues,
    setErrors,
  };
}

/**
 * useIntersectionObserver - Lazy loading and scroll detection
 */
export function useIntersectionObserver(options = {}) {
  const [isIntersecting, setIsIntersecting] = React.useState(false);
  const [entry, setEntry] = React.useState(null);
  const elementRef = React.useRef(null);

  React.useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
      setEntry(entry);
    }, {
      threshold: options.threshold || 0,
      rootMargin: options.rootMargin || '0px',
      ...options,
    });

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [options.threshold, options.rootMargin]);

  return [elementRef, isIntersecting, entry];
}

/**
 * useLocalStorage (Non-React version for vanilla JS)
 */
export const createLocalStorageHook = (key, initialValue) => {
  return () => {
    const readValue = () => {
      try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : initialValue;
      } catch (error) {
        console.warn(`Error reading localStorage key "${key}":`, error);
        return initialValue;
      }
    };

    const setValue = (value) => {
      try {
        const valueToStore = typeof value === 'function' ? value(readValue()) : value;
        localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    };

    return [readValue(), setValue];
  };
};

export default {
  useLocalStorage,
  useDebounce,
  useMediaQuery,
  useFetch,
  useForm,
  useIntersectionObserver,
  createLocalStorageHook,
};

import { createContext, useContext, useReducer, useCallback, useEffect } from 'react';

function loadPersisted() {
  try {
    const raw = localStorage.getItem('fadoc_app_state');
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        eventType: parsed.eventType ?? '',
        imeSubType: parsed.imeSubType ?? '',
        country: parsed.country ?? 'India',
        countryTimezoneId: parsed.countryTimezoneId ?? null,
        arrangeVenueData: {},
        trialStatus: null,
      };
    }
  } catch {
    // ignore
  }
  return {
    eventType: '',
    imeSubType: '',
    country: 'India',
    countryTimezoneId: null,
    arrangeVenueData: {},
    trialStatus: null,
  };
}

const initialState = loadPersisted();

const AppContext = createContext(null);

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_EVENT_TYPE':
      return { ...state, eventType: action.payload, imeSubType: action.payload === 'IME' ? 'Psychological IME' : '' };
    case 'SET_IME_SUB_TYPE':
      return { ...state, imeSubType: action.payload };
    case 'SET_COUNTRY':
      return { ...state, country: action.payload, countryTimezoneId: null };
    case 'SET_COUNTRY_TIMEZONE':
      return { ...state, countryTimezoneId: action.payload };
    case 'UPDATE_ARRANGE_VENUE_FIELD':
      return {
        ...state,
        arrangeVenueData: {
          ...state.arrangeVenueData,
          [action.payload.field]: action.payload.value,
        },
      };
    case 'SET_ARRANGE_VENUE_DATA':
      return { ...state, arrangeVenueData: action.payload };
    case 'SET_TRIAL_STATUS':
      return { ...state, trialStatus: action.payload };
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    try {
      localStorage.setItem(
        'fadoc_app_state',
        JSON.stringify({
          eventType: state.eventType,
          imeSubType: state.imeSubType,
          country: state.country,
          countryTimezoneId: state.countryTimezoneId,
        })
      );
    } catch {
      // ignore
    }
  }, [state.eventType, state.imeSubType, state.country, state.countryTimezoneId]);

  const setEventType = useCallback((value) => {
    dispatch({ type: 'SET_EVENT_TYPE', payload: value });
  }, []);

  const setImeSubType = useCallback((value) => {
    dispatch({ type: 'SET_IME_SUB_TYPE', payload: value });
  }, []);

  const setCountry = useCallback((value) => {
    dispatch({ type: 'SET_COUNTRY', payload: value });
  }, []);

  const setCountryTimezone = useCallback((timezoneId) => {
    dispatch({ type: 'SET_COUNTRY_TIMEZONE', payload: timezoneId });
  }, []);

  const updateArrangeVenueField = useCallback((field, value) => {
    dispatch({ type: 'UPDATE_ARRANGE_VENUE_FIELD', payload: { field, value } });
  }, []);

  const setArrangeVenueData = useCallback((data) => {
    dispatch({ type: 'SET_ARRANGE_VENUE_DATA', payload: data });
  }, []);

  const setTrialStatus = useCallback((status) => {
    dispatch({ type: 'SET_TRIAL_STATUS', payload: status });
  }, []);

  const getEventTypeForBackend = useCallback(() => {
    if (state.eventType === 'IME' && state.imeSubType) {
      return state.imeSubType;
    }
    return state.eventType || '';
  }, [state.eventType, state.imeSubType]);

  const value = {
    ...state,
    setEventType,
    setImeSubType,
    setCountry,
    setCountryTimezone,
    updateArrangeVenueField,
    setArrangeVenueData,
    setTrialStatus,
    getEventTypeForBackend,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

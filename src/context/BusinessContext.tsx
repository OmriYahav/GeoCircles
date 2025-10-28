import React, {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

export type Business = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
  offerText: string;
  logoUrl?: string | null;
  expiryDate?: string | number | null;
};

export type NearbyBusinessState = {
  business: Business | null;
  businessChatId: string | null;
};

type BusinessContextValue = NearbyBusinessState & {
  setNearbyBusiness: (next: Business | null) => void;
};

const BusinessContext = createContext<BusinessContextValue | undefined>(
  undefined
);

export function BusinessProvider({ children }: { children: ReactNode }) {
  const [nearbyBusiness, setNearbyBusiness] = useState<NearbyBusinessState>({
    business: null,
    businessChatId: null,
  });

  const handleSetNearbyBusiness = useCallback(
    (next: Business | null) => {
      setNearbyBusiness(
        next
          ? { business: next, businessChatId: next.id }
          : { business: null, businessChatId: null }
      );
    },
    []
  );

  const value = useMemo<BusinessContextValue>(
    () => ({
      business: nearbyBusiness.business,
      businessChatId: nearbyBusiness.businessChatId,
      setNearbyBusiness: handleSetNearbyBusiness,
    }),
    [handleSetNearbyBusiness, nearbyBusiness.business, nearbyBusiness.businessChatId]
  );

  return (
    <BusinessContext.Provider value={value}>
      {children}
    </BusinessContext.Provider>
  );
}

export function useBusinessContext() {
  const context = useContext(BusinessContext);
  if (!context) {
    throw new Error("useBusinessContext must be used within a BusinessProvider");
  }
  return context;
}

export function useNearbyBusinessChat() {
  const { business, businessChatId } = useBusinessContext();
  return { nearbyBusiness: business, businessChatId };
}


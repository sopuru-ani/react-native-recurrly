import { HOME_SUBSCRIPTIONS } from "@/constants/data";
import dayjs from "dayjs";
import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export function getUpcomingSubscriptions(
  subscriptions: Subscription[],
): UpcomingSubscription[] {
  const today = dayjs().startOf("day");

  return subscriptions
    .filter(
      (subscription) =>
        subscription.status === "active" &&
        subscription.renewalDate &&
        dayjs(subscription.renewalDate).isValid(),
    )
    .map((subscription) => ({
      id: subscription.id,
      icon: subscription.icon,
      name: subscription.name,
      price: subscription.price,
      currency: subscription.currency,
      daysLeft: dayjs(subscription.renewalDate)
        .startOf("day")
        .diff(today, "day"),
    }))
    .filter((subscription) => subscription.daysLeft >= 0)
    .sort((a, b) => a.daysLeft - b.daysLeft);
}

type SubscriptionsContextValue = {
  subscriptions: Subscription[];
  upcomingSubscriptions: UpcomingSubscription[];
  addSubscription: (subscription: Subscription) => void;
};

const SubscriptionsContext = createContext<SubscriptionsContextValue | null>(
  null,
);

export function SubscriptionsProvider({ children }: { children: ReactNode }) {
  const [subscriptions, setSubscriptions] = useState(HOME_SUBSCRIPTIONS);

  const upcomingSubscriptions = useMemo(
    () => getUpcomingSubscriptions(subscriptions),
    [subscriptions],
  );

  const addSubscription = (subscription: Subscription) => {
    setSubscriptions((current) => [subscription, ...current]);
  };

  return (
    <SubscriptionsContext.Provider
      value={{ subscriptions, upcomingSubscriptions, addSubscription }}
    >
      {children}
    </SubscriptionsContext.Provider>
  );
}

export function useSubscriptions() {
  const context = useContext(SubscriptionsContext);

  if (!context) {
    throw new Error(
      "useSubscriptions must be used within a SubscriptionsProvider",
    );
  }

  return context;
}

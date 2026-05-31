export type AnalyticsEventMap = {
  subscription_created: {
    subscription_name: string;
    price: number;
    currency: string;
    billing: string;
    category: string;
    status: string;
  };
};

export type AnalyticsEvent = keyof AnalyticsEventMap;

export function subscriptionCreatedProperties(
  subscription: Subscription,
): AnalyticsEventMap["subscription_created"] {
  return {
    subscription_name: subscription.name,
    price: subscription.price,
    currency: subscription.currency ?? "USD",
    billing: subscription.billing,
    category: subscription.category ?? "Other",
    status: subscription.status ?? "active",
  };
}

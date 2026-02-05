import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { useAuthStore } from '@/stores/auth';

// Reset all stores before each test
export function resetStores() {
  useAuthStore.setState({
    user: null,
    token: null,
    isLoading: false,
    error: null,
  });
}

// Custom render function
const AllProviders = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };

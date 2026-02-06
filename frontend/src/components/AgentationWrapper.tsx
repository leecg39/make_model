'use client';

import { Agentation } from 'agentation';

export function AgentationWrapper() {
  // 개발 환경에서만 렌더링
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return <Agentation />;
}

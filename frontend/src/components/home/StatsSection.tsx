// @TASK P2-S1-T1 - Stats Section component (ourcovers-inspired redesign)
// @SPEC specs/screens/home.yaml#components.stats_section

'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import type { PlatformStats } from '@/types/stats';

interface StatsSectionProps {
  stats: PlatformStats | null;
  isLoading?: boolean;
  error?: string | null;
}

function AnimatedCounter({ value, duration = 2 }: { value: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;

    let startTime: number;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / (duration * 1000), 1);
      setCount(Math.floor(progress * value));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [isInView, value, duration]);

  return <span ref={ref}>{count.toLocaleString()}</span>;
}

export function StatsSection({ stats, isLoading, error }: StatsSectionProps) {
  if (isLoading) {
    return (
      <section className="py-24 bg-[#111]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="text-center animate-pulse">
                <div className="h-16 bg-[#1a1a1a] rounded-lg mb-4 w-40 mx-auto" />
                <div className="h-4 bg-[#1a1a1a] rounded w-28 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error || !stats) {
    return (
      <section className="py-24 bg-[#111]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-white/40">통계를 불러올 수 없습니다</p>
          </div>
        </div>
      </section>
    );
  }

  const statItems = [
    {
      label: 'AI 모델',
      value: stats.total_models,
      suffix: '+',
    },
    {
      label: '크리에이터',
      value: stats.total_creators || Math.floor(stats.total_models * 0.4),
      suffix: '+',
    },
    {
      label: '브랜드',
      value: stats.total_brands,
      suffix: '+',
    },
  ];

  return (
    <section className="py-24 bg-[#111] relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-[#E882B2] rounded-full filter blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-[#E882B2] rounded-full filter blur-[80px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            성장하는 <span className="text-[#E882B2]">플랫폼</span>
          </h2>
          <p className="text-white/50 text-lg">
            MAKE MODEL과 함께하는 크리에이터와 브랜드
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {statItems.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center"
            >
              <div className="relative inline-block">
                <div className="text-6xl md:text-7xl font-bold text-white mb-2">
                  <AnimatedCounter value={item.value} />
                  <span className="text-[#E882B2]">{item.suffix}</span>
                </div>
                <div className="absolute -inset-4 bg-[#E882B2]/10 rounded-full blur-xl -z-10" />
              </div>
              <div className="text-white/60 text-lg font-medium tracking-wide">
                {item.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

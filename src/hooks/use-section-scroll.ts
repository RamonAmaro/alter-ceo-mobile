import { useCallback, useEffect, useRef, useState } from "react";
import { type NativeScrollEvent, type NativeSyntheticEvent, ScrollView } from "react-native";

import type { PlanTab } from "@/components/my-plan/plan-nav-tabs";

interface UseSectionScrollReturn {
  scrollRef: React.RefObject<ScrollView | null>;
  activeTab: string;
  handleSectionLayout: (key: string, y: number) => void;
  handleTabPress: (key: string) => void;
  handleScroll: (e: NativeSyntheticEvent<NativeScrollEvent>) => void;
}

export function useSectionScroll(tabs: readonly PlanTab[]): UseSectionScrollReturn {
  const scrollRef = useRef<ScrollView>(null);
  const sectionOffsets = useRef<Record<string, number>>({});
  const [activeTab, setActiveTab] = useState(() => tabs[0]?.key ?? "");

  const activeTabRef = useRef(activeTab);
  activeTabRef.current = activeTab;
  const isScrollingToTab = useRef(false);
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    return () => {
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
    };
  }, []);

  const handleSectionLayout = useCallback((key: string, y: number) => {
    sectionOffsets.current[key] = y;
  }, []);

  const handleTabPress = useCallback((key: string) => {
    setActiveTab(key);
    isScrollingToTab.current = true;
    if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
    const offset = sectionOffsets.current[key];
    if (offset !== undefined && scrollRef.current) {
      scrollRef.current.scrollTo({ y: offset - 8, animated: true });
      scrollTimerRef.current = setTimeout(() => {
        isScrollingToTab.current = false;
      }, 600);
    } else {
      isScrollingToTab.current = false;
    }
  }, []);

  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (isScrollingToTab.current) return;
      const scrollY = e.nativeEvent.contentOffset.y + 60;
      const keys = tabs.map((t) => t.key);
      let current = keys[0];
      for (const key of keys) {
        const offset = sectionOffsets.current[key];
        if (offset !== undefined && scrollY >= offset) {
          current = key;
        }
      }
      if (current && current !== activeTabRef.current) {
        setActiveTab(current);
      }
    },
    [tabs],
  );

  return { scrollRef, activeTab, handleSectionLayout, handleTabPress, handleScroll };
}

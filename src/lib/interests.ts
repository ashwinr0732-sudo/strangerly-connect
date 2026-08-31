import {
  Ban,
  BookOpen,
  Camera,
  Car,
  Clapperboard,
  CodeXml,
  Dribbble,
  Dumbbell,
  Gamepad2,
  Globe,
  Laptop,
  Laugh,
  Mic,
  Music,
  Palette,
  Pizza,
  Plane,
  Shirt,
  Smile,
  Sparkles,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { Interest, PremiumFeatureKey, PremiumPlan } from "@/types";

export const MAX_INTERESTS = 5;

export const INTERESTS: Interest[] = [
  { id: "gaming", label: "Gaming", icon: "Gamepad2" },
  { id: "music", label: "Music", icon: "Music" },
  { id: "movies", label: "Movies", icon: "Clapperboard" },
  { id: "anime", label: "Anime", icon: "Smile" },
  { id: "technology", label: "Technology", icon: "Laptop" },
  { id: "travel", label: "Travel", icon: "Plane" },
  { id: "cars", label: "Cars", icon: "Car" },
  { id: "sports", label: "Sports", icon: "Dribbble" },
  { id: "memes", label: "Memes", icon: "Laugh" },
  { id: "coding", label: "Coding", icon: "CodeXml" },
  { id: "food", label: "Food", icon: "Pizza" },
  { id: "photography", label: "Photography", icon: "Camera" },
  { id: "fitness", label: "Fitness", icon: "Dumbbell" },
  { id: "books", label: "Books", icon: "BookOpen" },
  { id: "art", label: "Art", icon: "Palette" },
  { id: "fashion", label: "Fashion", icon: "Shirt" },
];

export const INTEREST_ICONS: Record<string, LucideIcon> = {
  gaming: Gamepad2,
  music: Music,
  movies: Clapperboard,
  anime: Smile,
  technology: Laptop,
  travel: Plane,
  cars: Car,
  sports: Dribbble,
  memes: Laugh,
  coding: CodeXml,
  food: Pizza,
  photography: Camera,
  fitness: Dumbbell,
  books: BookOpen,
  art: Palette,
  fashion: Shirt,
};

/** Normalize raw typed text into a hashtag interest id. */
export function normalizeInterestInput(raw: string): string {
  return raw
    .trim()
    .replace(/^#+/, "")
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export const PREMIUM_PLANS: PremiumPlan[] = [
  {
    id: "week",
    name: "1 Week",
    price: 99,
    currency: "₹",
    cadence: "per week",
    billingNote: "₹99 billed weekly",
  },
  {
    id: "month",
    name: "1 Month",
    price: 249,
    currency: "₹",
    cadence: "per month",
    billingNote: "₹249 billed monthly",
    popular: true,
  },
  {
    id: "year",
    name: "1 Year",
    price: 1499,
    currency: "₹",
    cadence: "per year",
    billingNote: "₹125/month billed yearly",
    badge: "Save 60%",
  },
];

export interface PremiumFeature {
  key: PremiumFeatureKey;
  icon: LucideIcon;
  title: string;
  description: string;
}

export const PREMIUM_FEATURES: PremiumFeature[] = [
  {
    key: "view-once-images",
    icon: Camera,
    title: "View-once Images",
    description: "Send photos that disappear after they're viewed.",
  },
  {
    key: "voice-messages",
    icon: Mic,
    title: "Voice Messages",
    description: "Talk instead of typing. Send and listen to voice messages.",
  },
  {
    key: "priority-matching",
    icon: Zap,
    title: "Priority Matching",
    description: "Get matched faster with priority in the queue.",
  },
  {
    key: "region-preference",
    icon: Globe,
    title: "Region Preference",
    description: "Choose where you want to meet people from.",
  },
  {
    key: "advanced-matching",
    icon: Sparkles,
    title: "Advanced Matching",
    description: "Fine-tune who you get matched with.",
  },
  {
    key: "ad-free",
    icon: Ban,
    title: "Ad-free Experience",
    description: "Enjoy distraction-free conversations.",
  },
];

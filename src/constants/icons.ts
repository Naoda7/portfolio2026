import * as LucideIcons from 'lucide-react';

export const ICON_MAP = {
  // --- Popular Brands ---
  Instagram: LucideIcons.Instagram,
  Github: LucideIcons.Github,
  X: LucideIcons.X,
  Linkedin: LucideIcons.Linkedin,
  Youtube: LucideIcons.Youtube,
  Twitch: LucideIcons.Twitch,
  Discord: LucideIcons.MessageSquare,
  TikTok: LucideIcons.Music2,
  Facebook: LucideIcons.Facebook,
  Threads: LucideIcons.AtSign,
  
  // --- Art & Shop ---
  Redbubble: LucideIcons.Store,
  TeePublic: LucideIcons.Shirt,
  ArtStation: LucideIcons.Palette,
  DeviantArt: LucideIcons.Brush,
  Behance: LucideIcons.Briefcase,
  Dribbble: LucideIcons.Dribbble,
  Etsy: LucideIcons.ShoppingBag,
  
  // --- Creative & Tech ---
  Bluesky: LucideIcons.Cloud,
  Figma: LucideIcons.Figma,
  Framer: LucideIcons.Triangle,
  Code: LucideIcons.Code2,
  Terminal: LucideIcons.Terminal,
  Layers: LucideIcons.Layers,
  
  // --- Contact & Web ---
  Website: LucideIcons.Globe,
  Email: LucideIcons.Mail,
  Phone: LucideIcons.Phone,
  Link: LucideIcons.Link2,
  Message: LucideIcons.MessageCircle,
  Map: LucideIcons.MapPin,
  
  // --- Misc ---
  Coffee: LucideIcons.Coffee,
  Heart: LucideIcons.Heart,
  Star: LucideIcons.Star,
  Zap: LucideIcons.Zap,
  Play: LucideIcons.PlayCircle,
  Download: LucideIcons.Download,
};

export type IconName = keyof typeof ICON_MAP;

export const getIconComponent = (name: IconName) => {
  return ICON_MAP[name] || LucideIcons.HelpCircle;
};
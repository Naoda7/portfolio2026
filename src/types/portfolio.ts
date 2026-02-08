export interface Portfolio {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  image_url: string;
  project_url: string;
}

export interface PortfolioSettings {
  title: string;
  banner_url: string | null;
  banner_title: string;
  banner_description: string;
}
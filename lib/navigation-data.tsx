import type React from "react"
import {
  Server,
  Network,
  Database,
  Brain,
  Code,
  Map,
  Shield,
  CreditCard,
  BookOpen,
  MessageSquare,
  FileSearch,
  Cpu,
  LineChart,
  Zap,
  HardDrive,
  HelpCircle,
  Home,
  Key,
  Boxes,
  Globe,
} from "lucide-react"

export interface NavItem {
  title: string
  href: string
  icon: React.ReactNode
  items?: NavSubItem[]
  section?: string
}

export interface NavSubItem {
  title: string
  href: string
  icon?: React.ReactNode
  items?: NavTertiaryItem[]
}

export interface NavTertiaryItem {
  title: string
  href: string
}

export interface NavCategory {
  title: string
  items: NavItem[]
}

// Main navigation structure used across the application
export const navigationStructure: NavCategory[] = [
  {
    title: "", // Empty title for Home as standalone
    items: [
      {
        title: "Home",
        href: "/dashboard",
        icon: <Home className="h-5 w-5" />,
      },
    ],
  },
  {
    title: "CORE INFRASTRUCTURE",
    items: [
      {
        title: "Compute",
        href: "/compute",
        icon: <Server className="h-5 w-5" />,
        items: [
          { title: "Virtual Machines", href: "/compute/machines" },
          { title: "AI Pods", href: "/compute/ai-pods" },
          { title: "Auto Scaling Groups", href: "/compute/auto-scaling" },
        ],
      },
      {
        title: "Storage",
        href: "/storage",
        icon: <Database className="h-5 w-5" />,
        items: [
          { title: "Block Storage", href: "/storage/block" },
          { title: "Object Storage", href: "/storage/object" },
        ],
      },
      {
        title: "Network",
        href: "/network",
        icon: <Network className="h-5 w-5" />,
        items: [
          { title: "VPC", href: "/network/vpc" },
          { title: "Security Groups", href: "/network/security-groups" },
          { title: "DNS", href: "/networking/dns" },
        ],
      },
      {
        title: "Kubernetes",
        href: "/kubernetes",
        icon: <Boxes className="h-5 w-5" />,
      },
      {
        title: "Databases",
        href: "/database",
        icon: <Database className="h-5 w-5" />,
      },
    ],
  },
  {
    title: "AI STUDIO",
    items: [
      {
        title: "Model Catalogue",
        href: "/model-catalogue",
        icon: <Brain className="h-5 w-5" />,
      },
      {
        title: "Fine-tuning",
        href: "/fine-tuning",
        icon: <Code className="h-5 w-5" />,
      },
      {
        title: "Deployment",
        href: "/deployment",
        icon: <Zap className="h-5 w-5" />,
      },
      {
        title: "Evaluation",
        href: "/evaluation",
        icon: <LineChart className="h-5 w-5" />,
      },
      {
        title: "Bhashik",
        href: "/bhashik",
        icon: <MessageSquare className="h-5 w-5" />,
      },
      {
        title: "DIS",
        href: "/dis",
        icon: <FileSearch className="h-5 w-5" />,
      },
    ],
  },
  {
    title: "OLA MAPS",
    items: [
      {
        title: "Ola Maps",
        href: "/ola-maps",
        icon: <Map className="h-5 w-5" />,
      },
    ],
  },
  {
    title: "ADMINISTRATION",
    items: [
      {
        title: "Billing and Usage",
        href: "/billing",
        icon: <CreditCard className="h-5 w-5" />,
      },
      {
        title: "Key Management System",
        href: "/key-management",
        icon: <Key className="h-5 w-5" />,
      },
      {
        title: "Certificate Manager",
        href: "/administration/certificates",
        icon: <Shield className="h-5 w-5" />,
      },
      {
        title: "IAM",
        href: "/iam",
        icon: <Shield className="h-5 w-5" />,
        items: [
          { title: "Users", href: "/iam/users" },
          { title: "Groups", href: "/iam/groups" },
          { title: "Roles", href: "/iam/roles" },
          { title: "Policies", href: "/iam/policies" },
        ],
      },
    ],
  },
  {
    title: "DEVELOPER TOOLS",
    items: [
      {
        title: "SDKs & Libraries",
        href: "/developer/sdks",
        icon: <Code className="h-5 w-5" />,
      },
    ],
  },
  {
    title: "HELP & RESOURCES",
    items: [
      {
        title: "Documentation",
        href: "/documentation",
        icon: <BookOpen className="h-5 w-5" />,
      },
      {
        title: "Support",
        href: "/support",
        icon: <HelpCircle className="h-5 w-5" />,
      },
    ],
  },
]

// Alternative navigation structure for left sidebar
export const leftSidebarNavigation: NavCategory[] = [
  {
    title: "MAIN",
    items: [
      {
        title: "Home",
        href: "/dashboard",
        icon: <Home className="h-5 w-5" />,
      },
    ],
  },
  {
    title: "CORE INFRASTRUCTURE",
    items: [
      {
        title: "Compute",
        href: "/compute",
        icon: <Cpu className="h-5 w-5" />,
        items: [
          { title: "Virtual Machines", href: "/compute/machines" },
          { title: "AI Pods", href: "/compute/ai-pods" },
          { title: "Auto Scaling Groups", href: "/compute/auto-scaling" },
        ],
      },
      {
        title: "Storage",
        href: "/storage",
        icon: <HardDrive className="h-5 w-5" />,
        items: [
          { title: "Block Storage", href: "/storage/block" },
          { title: "Object Storage", href: "/storage/object" },
        ],
      },
      {
        title: "Network",
        href: "/network",
        icon: <Network className="h-5 w-5" />,
        items: [
          { title: "VPC", href: "/network/vpc" },
          { title: "Security Groups", href: "/network/security-groups" },
          { title: "DNS", href: "/networking/dns" },
        ],
      },
      {
        title: "Databases",
        href: "/database",
        icon: <Database className="h-5 w-5" />,
      },
    ],
  },
  {
    title: "AI STUDIO",
    items: [
      {
        title: "Model Catalogue",
        href: "/model-catalogue",
        icon: <Brain className="h-5 w-5" />,
      },
      {
        title: "Fine-tuning",
        href: "/fine-tuning",
        icon: <Code className="h-5 w-5" />,
      },
      {
        title: "Deployment",
        href: "/deployment",
        icon: <Zap className="h-5 w-5" />,
      },
      {
        title: "Evaluation",
        href: "/evaluation",
        icon: <LineChart className="h-5 w-5" />,
      },
      {
        title: "Bhashik",
        href: "/bhashik",
        icon: <MessageSquare className="h-5 w-5" />,
      },
      {
        title: "DIS",
        href: "/dis",
        icon: <FileSearch className="h-5 w-5" />,
      },
    ],
  },
  {
    title: "OLA MAPS",
    items: [
      {
        title: "Ola Maps",
        href: "/ola-maps",
        icon: <Map className="h-5 w-5" />,
      },
    ],
  },
  {
    title: "ADMINISTRATION",
    items: [
      {
        title: "Billing and Usage",
        href: "/billing",
        icon: <CreditCard className="h-5 w-5" />,
      },
      {
        title: "Key Management System",
        href: "/key-management",
        icon: <Key className="h-5 w-5" />,
      },
      {
        title: "Certificate Manager",
        href: "/administration/certificates",
        icon: <Shield className="h-5 w-5" />,
      },
      {
        title: "IAM",
        href: "/iam",
        icon: <Shield className="h-5 w-5" />,
        items: [
          { title: "Users", href: "/iam/users" },
          { title: "Groups", href: "/iam/groups" },
          { title: "Roles", href: "/iam/roles" },
          { title: "Policies", href: "/iam/policies" },
        ],
      },
    ],
  },
  {
    title: "DEVELOPER TOOLS",
    items: [
      {
        title: "SDKs & Libraries",
        href: "/developer/sdks",
        icon: <Code className="h-5 w-5" />,
      },
    ],
  },
  {
    title: "HELP & RESOURCES",
    items: [
      {
        title: "Documentation",
        href: "/documentation",
        icon: <BookOpen className="h-5 w-5" />,
      },
      {
        title: "Support",
        href: "/support",
        icon: <HelpCircle className="h-5 w-5" />,
      },
    ],
  },
]

// Helper function to get section from pathname
export function getSectionFromPathname(pathname: string): string {
  if (
    pathname.startsWith("/compute") ||
    pathname.startsWith("/storage") ||
    pathname.startsWith("/network") ||
    pathname.startsWith("/networking") ||
    pathname.startsWith("/database") ||
    pathname.startsWith("/infrastructure")
  ) {
    return "infrastructure"
  } else if (
    pathname.startsWith("/model-catalogue") ||
    pathname.startsWith("/fine-tuning") ||
    pathname.startsWith("/deployment") ||
    pathname.startsWith("/evaluation") ||
    pathname.startsWith("/bhashik") ||
    pathname.startsWith("/dis") ||
    pathname.startsWith("/ai-studio")
  ) {
    return "ai-studio"
  } else if (pathname.startsWith("/ola-maps")) {
    return "ola-maps"
  } else if (
    pathname.startsWith("/billing") ||
    pathname.startsWith("/key-management") ||
    pathname.startsWith("/iam") ||
    pathname.startsWith("/administration")
  ) {
    return "administration"
  } else if (pathname.startsWith("/developer")) {
    return "developer-tools"
  } else if (pathname.startsWith("/documentation") || pathname.startsWith("/support")) {
    return "help-resources"
  } else if (pathname.startsWith("/dashboard")) {
    return "home"
  }

  return ""
}

// Helper function to get section title
export function getSectionTitle(section: string): string {
  switch (section) {
    case "infrastructure":
      return "Core Infrastructure"
    case "ai-studio":
      return "AI Studio"
    case "ola-maps":
      return "Ola Maps"
    case "administration":
      return "Administration"
    case "developer-tools":
      return "Developer Tools"
    case "help-resources":
      return "Help & Resources"
    case "home":
      return "Home"
    default:
      return "Home"
  }
}

// Helper function to get navigation items for a section
export function getNavigationItemsForSection(section: string): NavItem[] {
  const sectionMap: Record<string, NavItem[]> = {
    infrastructure: navigationStructure.find((category) => category.title === "CORE INFRASTRUCTURE")?.items || [],
    "ai-studio": navigationStructure.find((category) => category.title === "AI STUDIO")?.items || [],
    "ola-maps": navigationStructure.find((category) => category.title === "OLA MAPS")?.items || [],
    administration: navigationStructure.find((category) => category.title === "ADMINISTRATION")?.items || [],
    "developer-tools": navigationStructure.find((category) => category.title === "DEVELOPER TOOLS")?.items || [],
    "help-resources": navigationStructure.find((category) => category.title === "HELP & RESOURCES")?.items || [],
    home: navigationStructure.find((category) => category.title === "")?.items || [],
  }

  return sectionMap[section] || []
}

// Helper function to check if a path is active
export function isPathActive(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/"
  }
  return pathname === href || pathname.startsWith(`${href}/`)
}
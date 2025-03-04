
import { Link, useLocation } from 'react-router-dom';
import { 
  BarChart3, 
  Home, 
  LineChart, 
  Settings, 
  History,
  TrendingUp,
  LayoutDashboard,
  ArrowRightLeft,
  FolderOpen
} from 'lucide-react';
import { 
  Sidebar, 
  SidebarContent, 
  SidebarGroup, 
  SidebarGroupContent,
  SidebarFooter, 
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem 
} from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';
import { MountTransition } from '@/components/ui/mt4-connector';

const AppSidebar = () => {
  const location = useLocation();

  const menuItems = [
    {
      title: 'Dashboard',
      path: '/',
      icon: LayoutDashboard
    },
    {
      title: 'Journal',
      path: '/journal',
      icon: History
    },
    {
      title: 'Statistics',
      path: '/statistics',
      icon: BarChart3
    },
    {
      title: 'Settings',
      path: '/settings',
      icon: Settings
    }
  ];

  return (
    <Sidebar>
      <SidebarHeader className="flex items-center justify-center p-4">
        <Link to="/" className="flex items-center">
          <ArrowRightLeft size={24} className="text-primary mr-2" />
          <span className="font-semibold text-xl tracking-tight">TradeTrack</span>
        </Link>
      </SidebarHeader>
      
      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.path}
                    className="transition-all duration-200"
                  >
                    <Link to={item.path} className="flex items-center gap-3 px-3 py-2">
                      <item.icon size={20} />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-6">
          <div className="px-3 mb-2 text-xs font-medium text-muted-foreground">
            PERFORMANCE
          </div>
          <SidebarGroupContent>
            <div className="px-3 py-2 rounded-md bg-accent/50">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <TrendingUp size={16} className="mr-2 text-primary" />
                  <span className="text-sm font-medium">Win Rate</span>
                </div>
                <Badge variant="outline" className="bg-primary/10 text-primary">
                  68%
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <LineChart size={16} className="mr-2 text-primary" />
                  <span className="text-sm font-medium">Profit</span>
                </div>
                <Badge variant="outline" className="bg-profit/10 text-profit">
                  +$2,165
                </Badge>
              </div>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="p-4 border-t">
        <MountTransition>
          <div className="space-y-2">
            <div className="text-xs font-medium text-muted-foreground mb-1">
              MT4 STATUS
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-neutral mr-2 animate-pulse-subtle"></div>
              <span className="text-sm">Not Connected</span>
            </div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <FolderOpen size={12} className="mr-1" />
              <span>Folder Watch: Inactive</span>
            </div>
          </div>
        </MountTransition>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;

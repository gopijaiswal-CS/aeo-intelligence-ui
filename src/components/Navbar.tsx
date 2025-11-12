import { useState } from "react";
import { Search, Bell, Settings, Menu, TrendingUp, AlertCircle, CheckCircle, X, LayoutDashboard } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface NavbarProps {
  onMenuClick: () => void;
}

interface Notification {
  id: number;
  type: "success" | "warning" | "info";
  title: string;
  message: string;
  time: string;
  read: boolean;
  link?: string;
}

export const Navbar = ({ onMenuClick }: NavbarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      type: "success",
      title: "Analysis Complete",
      message: "SmartHome Speaker analysis finished with 76% visibility score",
      time: "2 min ago",
      read: false,
      link: "/product/1",
    },
    {
      id: 2,
      type: "info",
      title: "New Competitor Detected",
      message: "Competitor F has been added to your tracking list",
      time: "1 hour ago",
      read: false,
      link: "/competitors",
    },
    {
      id: 3,
      type: "warning",
      title: "Broken Links Found",
      message: "4 broken links detected in AI Camera profile",
      time: "3 hours ago",
      read: false,
      link: "/product/2",
    },
    {
      id: 4,
      type: "success",
      title: "Score Improved",
      message: "Wireless Earbuds visibility increased by +5%",
      time: "1 day ago",
      read: true,
      link: "/product/5",
    },
    {
      id: 5,
      type: "info",
      title: "Weekly Report Ready",
      message: "Your weekly AEO performance report is available",
      time: "2 days ago",
      read: true,
      link: "/dashboard",
    },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: number) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    markAsRead(notification.id);
    // Navigate if link exists
    if (notification.link) {
      navigate(notification.link);
      setIsOpen(false); // Close popover
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-success" />;
      case "warning":
        return <AlertCircle className="h-5 w-5 text-warning" />;
      default:
        return <TrendingUp className="h-5 w-5 text-info" />;
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="flex h-16 items-center px-4 lg:px-6">
        <div className="flex items-center gap-2 mr-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 via-orange-400 to-blue-500 flex items-center justify-center relative overflow-hidden">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g transform="translate(12, 10)">
                <rect x="-5" y="5" width="10" height="1.5" rx="0.5" fill="white" opacity="0.5"/>
                <rect x="-4.5" y="2.5" width="9" height="1.5" rx="0.5" fill="white" opacity="0.7"/>
                <rect x="-4" y="0" width="8" height="1.5" rx="0.5" fill="white" opacity="0.95"/>
                <circle cx="0" cy="-3" r="2.5" fill="white" opacity="0.95"/>
                <path d="M -1.2,-3.8 Q -1.5,-4.5 -0.8,-5 Q 0,-5.3 0.8,-5 Q 1.5,-4.5 1.2,-3.8 Q 0.8,-3 0,-2.8 Q -0.8,-3 -1.2,-3.8 Z" 
                      fill="#3B82F6" opacity="0.9"/>
                <circle cx="-0.6" cy="-3.5" r="0.4" fill="#F97316"/>
                <circle cx="0.6" cy="-3.5" r="0.4" fill="#F97316"/>
              </g>
            </svg>
          </div>
          <span className="font-semibold text-lg hidden sm:inline bg-gradient-to-r from-orange-500 via-orange-400 to-blue-500 bg-clip-text text-transparent">StackIQ</span>
        </div>

        <div className="flex-1 max-w-md mx-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products, competitors..."
              className="pl-9 bg-background"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Dashboard Button */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate("/dashboard")}
            className={cn(
              "relative",
              (location.pathname === "/" || location.pathname === "/dashboard") && "bg-primary/10 text-primary"
            )}
          >
            <LayoutDashboard className="h-5 w-5" />
          </Button>

          {/* Notifications Dropdown */}
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-96 p-0" align="end">
              <div className="flex items-center justify-between p-4 border-b">
                <div>
                  <h3 className="font-semibold">Notifications</h3>
                  <p className="text-xs text-muted-foreground">
                    {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                  </p>
                </div>
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="text-xs"
                  >
                    Mark all read
                  </Button>
                )}
              </div>

              <ScrollArea className="h-[400px]">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Bell className="h-12 w-12 text-muted-foreground/50 mb-3" />
                    <p className="text-sm text-muted-foreground">No notifications</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 transition-colors ${
                          !notification.read ? 'bg-primary/5' : ''
                        } ${notification.link ? 'hover:bg-muted/50 cursor-pointer' : ''}`}
                        onClick={() => notification.link && handleNotificationClick(notification)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-1">{getIcon(notification.type)}</div>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-sm font-medium leading-none">
                                {notification.title}
                              </p>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 -mt-1"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteNotification(notification.id);
                                }}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {notification.message}
                            </p>
                            <div className="flex items-center gap-2">
                              <p className="text-xs text-muted-foreground">
                                {notification.time}
                              </p>
                              {!notification.read && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 px-2 text-xs"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    markAsRead(notification.id);
                                  }}
                                >
                                  Mark as read
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>

              {notifications.length > 0 && (
                <div className="p-3 border-t">
                  <Button
                    variant="ghost"
                    className="w-full text-xs"
                    onClick={() => setNotifications([])}
                  >
                    Clear all notifications
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>

          <Button variant="ghost" size="icon" onClick={() => navigate("/settings")}>
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </nav>
  );
};

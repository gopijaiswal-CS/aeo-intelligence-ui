import { useState, useEffect } from "react";
import {
  Search,
  Bell,
  Settings,
  Menu,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  X,
  LayoutDashboard,
  Loader2,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import * as api from "@/services/api";
import { toast } from "sonner";

interface NavbarProps {
  onMenuClick: () => void;
}

export const Navbar = ({ onMenuClick }: NavbarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<api.Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Load notifications on mount and set up polling
  useEffect(() => {
    loadNotifications();

    // Poll for new notifications every 30 seconds
    const interval = setInterval(() => {
      loadNotifications(true); // Silent refresh
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const loadNotifications = async (silent = false) => {
    try {
      if (!silent) setIsLoading(true);

      const response = await api.getNotifications(50, 0, false);

      if (response.success && response.data) {
        setNotifications(response.data.notifications);
        setUnreadCount(response.data.unreadCount);
      }
    } catch (error) {
      console.error("Error loading notifications:", error);
      if (!silent) {
        toast.error("Failed to load notifications");
      }
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const response = await api.markNotificationAsRead(id);

      if (response.success) {
        setNotifications((prev) =>
          prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await api.markAllNotificationsAsRead();

      if (response.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);
        toast.success("All notifications marked as read");
      }
    } catch (error) {
      console.error("Error marking all as read:", error);
      toast.error("Failed to mark all as read");
    }
  };

  const clearAll = async () => {
    try {
      const response = await api.deleteAllNotifications();

      if (response.success) {
        setNotifications([]);
        setUnreadCount(0);
        toast.success("All notifications cleared");
      }
    } catch (error) {
      console.error("Error clearing notifications:", error);
      toast.error("Failed to clear notifications");
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const response = await api.deleteNotification(id);

      if (response.success) {
        const notification = notifications.find((n) => n._id === id);
        setNotifications((prev) => prev.filter((n) => n._id !== id));
        if (notification && !notification.isRead) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
      toast.error("Failed to delete notification");
    }
  };

  const handleNotificationClick = (notification: api.Notification) => {
    // Mark as read
    if (!notification.isRead) {
      markAsRead(notification._id);
    }

    // Navigate to action URL
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
      setIsOpen(false);
    }
  };

  const getNotificationIcon = (type: api.Notification["type"]) => {
    switch (type) {
      case "analysis_complete":
      case "score_improvement":
      case "profile_created":
      case "questions_generated":
      case "report_ready":
        return <CheckCircle className="h-4 w-4 text-success" />;
      case "score_drop":
      case "broken_link":
      case "warning":
        return <AlertCircle className="h-4 w-4 text-warning" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      case "competitor_update":
      case "system":
      default:
        return <TrendingUp className="h-4 w-4 text-info" />;
    }
  };

  const getPriorityColor = (priority: api.Notification["priority"]) => {
    switch (priority) {
      case "urgent":
        return "bg-destructive/10 border-destructive/20";
      case "high":
        return "bg-warning/10 border-warning/20";
      case "medium":
        return "bg-info/10 border-info/20";
      case "low":
      default:
        return "bg-muted/50 border-border";
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24)
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    return date.toLocaleDateString();
  };

  const handleDashboardClick = () => {
    navigate("/dashboard");
  };

  const handleSettingsClick = () => {
    navigate("/settings");
  };

  const isDashboardActive =
    location.pathname === "/" || location.pathname === "/dashboard";
  const isSettingsActive = location.pathname === "/settings";

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="flex h-16 items-center px-4 lg:px-6">
        <div
          className="flex items-center gap-2 mr-4 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 via-orange-400 to-blue-500 flex items-center justify-center relative overflow-hidden">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g transform="translate(12, 10)">
                <rect
                  x="-5"
                  y="5"
                  width="10"
                  height="1.5"
                  rx="0.5"
                  fill="white"
                  opacity="0.5"
                />
                <rect
                  x="-4.5"
                  y="2.5"
                  width="9"
                  height="1.5"
                  rx="0.5"
                  fill="white"
                  opacity="0.7"
                />
                <rect
                  x="-4"
                  y="0"
                  width="8"
                  height="1.5"
                  rx="0.5"
                  fill="white"
                  opacity="0.95"
                />
                <circle cx="0" cy="-3" r="2.5" fill="white" opacity="0.95" />
                <path
                  d="M -1.2,-3.8 Q -1.5,-4.5 -0.8,-5 Q 0,-5.3 0.8,-5 Q 1.5,-4.5 1.2,-3.8 Q 0.8,-3 0,-2.8 Q -0.8,-3 -1.2,-3.8 Z"
                  fill="#3B82F6"
                  opacity="0.9"
                />
                <circle cx="-0.6" cy="-3.5" r="0.4" fill="#F97316" />
                <circle cx="0.6" cy="-3.5" r="0.4" fill="#F97316" />
              </g>
            </svg>
          </div>
          <span className="font-semibold text-lg hidden sm:inline bg-gradient-to-r from-orange-500 via-orange-400 to-blue-500 bg-clip-text text-transparent">
            StackIQ
          </span>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {/* Dashboard Tab */}
          <Button
            variant={isDashboardActive ? "default" : "ghost"}
            size="sm"
            onClick={handleDashboardClick}
            className={cn(
              "gap-2",
              isDashboardActive && "bg-primary text-primary-foreground"
            )}
          >
            <LayoutDashboard className="h-4 w-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </Button>

          {/* Notifications */}
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  >
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-96 p-0" align="end">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="font-semibold">Notifications</h3>
                <div className="flex gap-2">
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
                  {notifications.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAll}
                      className="text-xs text-destructive"
                    >
                      Clear all
                    </Button>
                  )}
                </div>
              </div>

              <ScrollArea className="h-[400px]">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Bell className="h-12 w-12 text-muted-foreground/50 mb-2" />
                    <p className="text-sm text-muted-foreground">
                      No notifications
                    </p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {notifications.map((notification) => (
                      <div
                        key={notification._id}
                        className={cn(
                          "p-4 hover:bg-muted/50 transition-colors cursor-pointer border-l-2",
                          !notification.isRead ? "bg-muted/30" : "",
                          getPriorityColor(notification.priority)
                        )}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-sm font-medium leading-none">
                                {notification.title}
                              </p>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 -mr-2 -mt-1"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteNotification(notification._id);
                                }}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {notification.message}
                            </p>
                            {notification.profileName && (
                              <p className="text-xs text-primary font-medium">
                                {notification.profileName}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground">
                              {formatTime(notification.createdAt)}
                            </p>
                          </div>
                          {!notification.isRead && (
                            <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </PopoverContent>
          </Popover>

          {/* Settings */}
          <Button
            variant={isSettingsActive ? "default" : "ghost"}
            size="icon"
            onClick={handleSettingsClick}
            className={cn(
              isSettingsActive && "bg-primary text-primary-foreground"
            )}
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </nav>
  );
};

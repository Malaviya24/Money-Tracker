import { Bell, Check, Trash2, AlertTriangle, Info, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNotifications, Notification } from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

const typeIcons = {
  info: Info,
  warning: AlertTriangle,
  success: CheckCircle,
  error: XCircle,
};

const typeColors = {
  info: "text-primary",
  warning: "text-[hsl(var(--warning))]",
  success: "text-[hsl(var(--success))]",
  error: "text-destructive",
};

interface NotificationDropdownProps {
  className?: string;
}

export function NotificationDropdown({ className }: NotificationDropdownProps) {
  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead, deleteNotification } =
    useNotifications();

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className={cn("relative", className)}>
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-2">
          <DropdownMenuLabel>Notifications</DropdownMenuLabel>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto py-1 px-2 text-xs"
              onClick={(e) => {
                e.preventDefault();
                markAllAsRead();
              }}
            >
              <Check className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />

        {isLoading ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            Loading...
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            No notifications yet
          </div>
        ) : (
          <div className="max-h-80 overflow-y-auto">
            {notifications.map((notification) => {
              const Icon = typeIcons[notification.type] || Info;
              const colorClass = typeColors[notification.type] || "text-primary";

              return (
                <DropdownMenuItem
                  key={notification.id}
                  className={cn(
                    "flex items-start gap-3 py-3 cursor-pointer focus:text-accent-foreground",
                    !notification.read && "bg-muted/50"
                  )}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <Icon className={cn("h-5 w-5 mt-0.5 shrink-0", colorClass)} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-medium text-sm">{notification.title}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 shrink-0 opacity-0 group-hover:opacity-100 hover:opacity-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification.id);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="text-xs opacity-70 mt-0.5">{notification.message}</p>
                    <p className="text-xs opacity-50 mt-1">
                      {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  {!notification.read && (
                    <span className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1.5" />
                  )}
                </DropdownMenuItem>
              );
            })}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

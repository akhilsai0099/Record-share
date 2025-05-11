import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Link } from "@tanstack/react-router";
import {
  addDays,
  format,
  isAfter,
  isBefore,
  isEqual,
  startOfDay,
} from "date-fns";
import {
  ArrowUpDown,
  Calendar as CalendarIcon,
  Search,
  SlidersHorizontal,
  Video as VideoIcon,
  X,
} from "lucide-react";
import React, { useMemo, useState } from "react";

// Define the Video type
export interface Video {
  id: string;
  fileName: string;
  title: string;
  createdAt: Date;
  size: number;
  thumbnailUrl: string;
}

// Date Range type
type DateRange = {
  from: Date | undefined;
  to: Date | undefined;
};

// Sort options
type SortOption = {
  label: string;
  value: keyof Video | "size";
  icon: React.ReactNode;
  direction: "asc" | "desc";
};

const sortOptions: SortOption[] = [
  {
    label: "Date (Newest)",
    value: "createdAt",
    icon: <CalendarIcon className="h-4 w-4" />,
    direction: "desc",
  },
  {
    label: "Date (Oldest)",
    value: "createdAt",
    icon: <CalendarIcon className="h-4 w-4" />,
    direction: "asc",
  },
  {
    label: "Size (Largest)",
    value: "size",
    icon: <ArrowUpDown className="h-4 w-4" />,
    direction: "desc",
  },
  {
    label: "Size (Smallest)",
    value: "size",
    icon: <ArrowUpDown className="h-4 w-4" />,
    direction: "asc",
  },
];

// Format file size to human-readable format
const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + " B";
  else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  else if (bytes < 1024 * 1024 * 1024)
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  return (bytes / (1024 * 1024 * 1024)).toFixed(1) + " GB";
};

// Format date to human-readable format
const formatDate = (date: Date): string => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

interface VideoGridProps {
  videos: Video[];
}

export function VideoGrid({ videos }: VideoGridProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSort, setActiveSort] = useState<SortOption>(sortOptions[0]);
  const [dateRange, setDateRange] = useState<DateRange>({
    from: undefined,
    to: undefined,
  });
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Handle date range selection with safety check
  const handleDateRangeSelect = (range: DateRange | undefined) => {
    // If range is undefined, maintain the current dateRange
    if (!range) return;
    setDateRange(range);
  };

  // Filter videos based on search query and date range
  const filteredVideos = useMemo(() => {
    return videos.filter((video) => {
      // Text search filter
      const matchesSearch = video.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      // Date range filter
      let matchesDateRange = true;

      if (dateRange?.from) {
        const from = startOfDay(dateRange.from);
        matchesDateRange =
          matchesDateRange &&
          (isAfter(new Date(video.createdAt), from) ||
            isEqual(new Date(video.createdAt), from));
      }

      if (dateRange?.to) {
        const to = startOfDay(addDays(dateRange.to, 1)); // Include the end date
        matchesDateRange =
          matchesDateRange && isBefore(new Date(video.createdAt), to);
      }

      return matchesSearch && matchesDateRange;
    });
  }, [videos, searchQuery, dateRange]);

  // Sort videos based on active sort option
  const sortedVideos = useMemo(() => {
    return [...filteredVideos].sort((a, b) => {
      const aValue = a[activeSort.value];
      const bValue = b[activeSort.value];

      if (activeSort.direction === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [filteredVideos, activeSort]);

  // Calculate video duration (placeholder for now)
  const getVideoDuration = () => {
    return "00:30"; // Placeholder duration
  };

  // Generate date range display text
  const getDateRangeText = () => {
    if (!dateRange?.from && !dateRange?.to) return "All Dates";

    if (dateRange?.from && dateRange?.to) {
      if (isEqual(dateRange.from, dateRange.to)) {
        return format(dateRange.from, "MMM d, yyyy");
      }
      return `${format(dateRange.from, "MMM d, yyyy")} - ${format(dateRange.to, "MMM d, yyyy")}`;
    }

    if (dateRange?.from)
      return `After ${format(dateRange.from, "MMM d, yyyy")}`;
    if (dateRange?.to) return `Before ${format(dateRange.to, "MMM d, yyyy")}`;

    return "All Dates";
  };

  // Clear date range filter
  const clearDateRange = () => {
    setDateRange({ from: undefined, to: undefined });
  };

  return (
    <div className="w-full space-y-6">
      {/* Search and filter row */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search videos..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                <span>Sort by: </span>
                <span className="font-medium">{activeSort.label}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {sortOptions.map((option) => (
                <DropdownMenuItem
                  key={option.label}
                  className={`flex items-center gap-2 ${activeSort.label === option.label ? "bg-accent text-accent-foreground" : ""}`}
                  onClick={() => setActiveSort(option)}
                >
                  {option.icon}
                  <span>{option.label}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="flex items-center gap-3">
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={`justify-start text-left gap-2 ${dateRange?.from || dateRange?.to ? "border-primary/50 text-primary" : ""}`}
                >
                  <CalendarIcon className="h-4 w-4" />
                  <span>{getDateRangeText()}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={handleDateRangeSelect}
                  numberOfMonths={2}
                />
                <div className="flex items-center justify-between p-3 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsCalendarOpen(false)}
                  >
                    Apply
                  </Button>
                  <Button variant="ghost" size="sm" onClick={clearDateRange}>
                    Clear
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            {/* Show clear button if date range is active */}
            {(dateRange?.from || dateRange?.to) && (
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                onClick={clearDateRange}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Clear date filter</span>
              </Button>
            )}
          </div>
        </div>

        {/* Date range picker */}
      </div>

      <Separator />

      {/* Video count */}
      <div className="text-sm text-muted-foreground">
        {sortedVideos.length} {sortedVideos.length === 1 ? "video" : "videos"}{" "}
        found
      </div>

      {/* Video grid */}
      {sortedVideos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {sortedVideos.map((video) => (
            <Link to="/videos/$id" params={{ id: video.id }} key={video.id}>
              <Card className="h-full overflow-hidden hover:border-primary/50 transition-all hover:shadow-md py-0 group">
                <div className="aspect-video relative bg-muted overflow-hidden">
                  {/* Display video thumbnail */}
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    className="absolute inset-0 w-full h-full object-cover z-0"
                    onError={(e) => {
                      // If thumbnail fails to load, show fallback icon
                      e.currentTarget.style.display = "none";
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-black/30 to-black/20 z-10">
                    <VideoIcon className="h-12 w-12 text-primary/70" />
                  </div>
                  <div className="absolute bottom-2 right-2 px-2 py-1 text-xs font-medium rounded-md bg-black/70 text-white z-20">
                    {getVideoDuration()}
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="text-lg font-semibold line-clamp-1 group-hover:text-primary transition-colors">
                    {video.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                    <CalendarIcon className="h-3.5 w-3.5" />
                    <span>{formatDate(video.createdAt)}</span>
                  </div>
                </CardContent>
                <CardFooter className="px-4 py-3 border-t bg-muted/30 flex justify-between text-xs text-muted-foreground">
                  <span>{formatFileSize(video.size)}</span>
                  <span className="text-primary font-medium">Watch now</span>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-muted p-3 mb-4">
            <VideoIcon className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium">No videos found</h3>
          <p className="text-muted-foreground mt-1 max-w-md">
            {searchQuery || dateRange?.from || dateRange?.to
              ? `No videos match your current filters`
              : "You haven't recorded any videos yet"}
          </p>
          {(searchQuery || dateRange?.from || dateRange?.to) && (
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setSearchQuery("");
                clearDateRange();
              }}
            >
              Clear all filters
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

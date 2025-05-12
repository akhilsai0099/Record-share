import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export function VideoGridSkeleton() {
  const skeletonItems = Array(8).fill(null);

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative flex-1 h-10 bg-muted/40 rounded-md animate-pulse"></div>
          <div className="h-10 w-[150px] bg-muted/40 rounded-md animate-pulse"></div>
          <div className="h-10 w-[120px] bg-muted/40 rounded-md animate-pulse"></div>
        </div>
      </div>

      <Separator />

      {/* Video count skeleton */}
      <div className="h-5 w-[100px] bg-muted/40 rounded animate-pulse"></div>

      {/* Video grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {skeletonItems.map((_, index) => (
          <Card key={index} className="h-full overflow-hidden">
            <div className="aspect-video bg-muted/50 animate-pulse"></div>
            <CardContent className="p-4">
              <div className="h-6 w-3/4 bg-muted/40 rounded animate-pulse mb-2"></div>
              <div className="h-4 w-1/2 bg-muted/30 rounded animate-pulse"></div>
            </CardContent>
            <CardFooter className="px-4 py-3 border-t bg-muted/30 flex justify-between">
              <div className="h-4 w-[60px] bg-muted/40 rounded animate-pulse"></div>
              <div className="h-4 w-[80px] bg-muted/40 rounded animate-pulse"></div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}

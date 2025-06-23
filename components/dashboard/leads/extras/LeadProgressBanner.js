
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";


export const LeadProgressBanner = ({ uploading, currentBatch, totalBatches, uploadProgress }) => {
  if (!uploading) return null;
  return (
    <Card className="fixed bottom-4 right-4 transform  w-[40%] z-50 shadow-lg p-4">
      <div className="flex justify-between items-center mb-2">
        <div className="text-sm font-medium">Uploading Leads</div>
        {/* <div className="text-sm">Batch {currentBatch} of {totalBatches}</div> */}
      </div>
      <Progress value={uploadProgress} className="h-2 bg-gray-200 [&>div]:bg-purple" />
    </Card>
  );
};
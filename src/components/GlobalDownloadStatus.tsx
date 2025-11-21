import { Download as DownloadIcon, X, Play, Pause } from "lucide-react";
import { useDownload } from "@/contexts/DownloadContext";
import { Button } from "@/components/ui/button";

const GlobalDownloadStatus = () => {
  const { downloadState, cancelDownload, resumeDownload } = useDownload();

  // Show if downloading or if there's a paused/interrupted download
  if (!downloadState.isDownloading && !downloadState.downloadStatus.includes('resume')) {
    return null;
  }

  const isInterrupted = downloadState.downloadStatus.includes('resume');
  const canResume = isInterrupted && !downloadState.isDownloading;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 max-w-md mx-auto">
      <div className="bg-white dark:bg-[#0d0d12] rounded-2xl p-4 border border-gray-200 dark:border-gray-900/50 shadow-lg backdrop-blur-sm">
        <div className="flex items-start gap-3 mb-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
            canResume ? 'bg-orange-500/10' : 'bg-blue-500/10'
          }`}>
            {canResume ? (
              <Pause className="w-5 h-5 text-orange-500" />
            ) : (
              <DownloadIcon className="w-5 h-5 text-blue-500 dark:text-blue-400" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-gray-900 dark:text-white font-medium text-sm truncate">
              {downloadState.totalIllustrations > 0 ? `${downloadState.totalIllustrations} Illustrations` : 'Pixiv Download'}
            </h4>
            <p className="text-xs text-gray-600 dark:text-gray-500 truncate">
              {downloadState.downloadStatus}
            </p>
            {downloadState.currentFileName && !canResume && (
              <p className="text-xs text-blue-600 dark:text-blue-400 truncate">
                {downloadState.currentFileName}
              </p>
            )}
            {downloadState.isDownloading && !canResume && (
              <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                💡 Stay on the page for best performance
              </p>
            )}
          </div>
          <div className="flex gap-1">
            {canResume && (
              <Button
                variant="ghost"
                size="sm"
                onClick={resumeDownload}
                className="h-8 w-8 p-0 hover:bg-green-100 dark:hover:bg-green-900/20"
                title="Resume Download"
              >
                <Play className="w-4 h-4 text-green-600" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={cancelDownload}
              className="h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-900/20"
              title="Cancel Download"
            >
              <X className="w-4 h-4 text-red-600" />
            </Button>
          </div>
        </div>

        {!canResume && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-gray-600 dark:text-gray-500">
                {downloadState.totalImages > 0 ? `${downloadState.currentImage}/${downloadState.totalImages}` : 'Processing...'}
              </span>
              <span className="text-[#0096fa] font-semibold">{Math.round(downloadState.progress)}%</span>
            </div>
            <div className="h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#0096fa] transition-all duration-300"
                style={{ width: `${downloadState.progress}%` }}
              />
            </div>
          </div>
        )}

        {canResume && (
          <div className="mt-2">
            <div className="flex justify-between text-xs text-orange-600 dark:text-orange-400">
              <span>Download interrupted</span>
              <span>Click play to resume</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GlobalDownloadStatus;
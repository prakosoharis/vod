import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Radio, Eye, RefreshCw, Play } from 'lucide-react';

interface StreamStatusData {
  isLive: boolean;
  streamKey: string | null;
  viewerCount: number;
  startTime?: string;
}

interface StreamStatusProps {
  streamStatus: StreamStatusData;
  defaultStreamKey: string;
  lastChecked: Date | null;
  onCheckStream: () => void;
  onGoLive: (streamKey: string) => void;
  isLoading: boolean;
}

const StreamStatus: React.FC<StreamStatusProps> = ({
  streamStatus,
  defaultStreamKey,
  lastChecked,
  onCheckStream,
  onGoLive,
  isLoading
}) => {
  const [customStreamKey, setCustomStreamKey] = useState('');
  const [showStreamKey, setShowStreamKey] = useState(false);

  const handleGoLive = () => {
    const key = customStreamKey.trim() || defaultStreamKey;
    onGoLive(key);
  };

  const copyStreamKey = () => {
    const key = customStreamKey.trim() || defaultStreamKey;
    navigator.clipboard.writeText(key)
      .then(() => {
        console.log('Stream key copied to clipboard');
      })
      .catch((err) => {
        console.error('Failed to copy:', err);
      });
  };

  const formatStartTime = (startTime?: string) => {
    if (!startTime) return 'Not started';
    const date = new Date(startTime);
    return date.toLocaleString('id-ID', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Radio className="w-5 h-5" />
          Stream Control
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Status */}
        <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${streamStatus.isLive ? 'bg-red-500 animate-pulse' : 'bg-gray-500'}`} />
            <span className="font-medium">
              {streamStatus.isLive ? 'Streaming Live' : 'Offline'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Eye className="w-4 h-4" />
            {streamStatus.viewerCount}
          </div>
        </div>

        {/* Stream Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <label className="text-gray-400">Stream Key:</label>
            <div className="font-mono bg-gray-800 p-2 rounded mt-1">
              {showStreamKey ? (customStreamKey.trim() || defaultStreamKey) : '••••••••'}
            </div>
          </div>
          <div>
            <label className="text-gray-400">Started:</label>
            <div className="bg-gray-800 p-2 rounded mt-1">
              {formatStartTime(streamStatus.startTime)}
            </div>
          </div>
        </div>

        {/* Custom Stream Key Input */}
        <div>
          <label className="text-sm text-gray-400 mb-2 block">
            Custom Stream Key (optional):
          </label>
          <Input
            type="text"
            value={customStreamKey}
            onChange={(e) => setCustomStreamKey(e.target.value)}
            placeholder={`Default: ${defaultStreamKey}`}
            className="bg-gray-800 border-gray-700"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => setShowStreamKey(!showStreamKey)}
            variant="outline"
            size="sm"
            className="border-gray-700"
          >
            {showStreamKey ? 'Hide' : 'Show'} Key
          </Button>

          <Button
            onClick={copyStreamKey}
            variant="outline"
            size="sm"
            className="border-gray-700"
          >
            Copy Key
          </Button>

          <Button
            onClick={onCheckStream}
            variant="outline"
            size="sm"
            disabled={isLoading}
            className="border-gray-700"
          >
            {isLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            Check Status
          </Button>

          <Button
            onClick={handleGoLive}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700"
          >
            <Play className="w-4 h-4 mr-2" />
            {streamStatus.isLive ? 'Switch Stream' : 'Go Live'}
          </Button>
        </div>

        {/* Last Checked */}
        {lastChecked && (
          <div className="text-xs text-gray-500 text-center">
            Last checked: {lastChecked.toLocaleTimeString('id-ID')}
          </div>
        )}

        {/* OBS Instructions */}
        <div className="bg-gray-800 p-3 rounded-lg text-xs">
          <p className="font-semibold mb-1">OBS Studio Settings:</p>
          <p>Service: Custom</p>
          <p>Server: rtmp://live.deluwang.online:1935/live</p>
          <p>Stream Key: {customStreamKey.trim() || defaultStreamKey}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default StreamStatus;
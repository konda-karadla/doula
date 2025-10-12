'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert } from '@/components/ui/alert';
import { 
  Download, 
  FileText, 
  Database, 
  CheckCircle,
  AlertCircle,
  Clock,
  FileSpreadsheet,
  Archive
} from 'lucide-react';

type ExportFormat = 'json' | 'csv' | 'pdf' | 'excel';
type ExportType = 'all' | 'lab_results' | 'action_plans' | 'health_insights' | 'profile';

interface ExportOption {
  id: ExportType;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  estimatedSize: string;
  includes: string[];
}

const exportOptions: ExportOption[] = [
  {
    id: 'all',
    label: 'Complete Data Export',
    description: 'All your health data in one comprehensive export',
    icon: Database,
    estimatedSize: '5-15 MB',
    includes: ['Profile information', 'All lab results', 'Action plans & items', 'Health insights', 'Statistics']
  },
  {
    id: 'lab_results',
    label: 'Lab Results Only',
    description: 'All uploaded lab results and biomarker data',
    icon: FileText,
    estimatedSize: '2-8 MB',
    includes: ['Lab result files', 'Biomarker data', 'Test dates', 'Reference ranges']
  },
  {
    id: 'action_plans',
    label: 'Action Plans & Items',
    description: 'All action plans and completed/pending items',
    icon: CheckCircle,
    estimatedSize: '1-3 MB',
    includes: ['Action plans', 'Action items', 'Completion status', 'Due dates', 'Progress tracking']
  },
  {
    id: 'health_insights',
    label: 'Health Insights',
    description: 'AI-generated insights and recommendations',
    icon: AlertCircle,
    estimatedSize: '500 KB - 2 MB',
    includes: ['Health insights', 'Recommendations', 'Trend analysis', 'Priority levels']
  },
  {
    id: 'profile',
    label: 'Profile Information',
    description: 'Personal information and account details',
    icon: Database,
    estimatedSize: '100-500 KB',
    includes: ['Personal details', 'Contact information', 'Medical information', 'Account settings']
  }
];

const formatOptions = [
  { id: 'json' as ExportFormat, label: 'JSON', description: 'Machine-readable format', icon: FileText },
  { id: 'csv' as ExportFormat, label: 'CSV', description: 'Spreadsheet format', icon: FileSpreadsheet },
];

export function DataExport() {
  const [selectedType, setSelectedType] = useState<ExportType>('all');
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('json');
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<'idle' | 'preparing' | 'ready' | 'error'>('idle');
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Cleanup blob URL on unmount or when new export is created
  useEffect(() => {
    return () => {
      if (downloadUrl) {
        window.URL.revokeObjectURL(downloadUrl);
      }
    };
  }, [downloadUrl]);

  const handleExport = async () => {
    setIsExporting(true);
    setError(null);
    setExportStatus('preparing');

    try {
      const { services } = await import('@health-platform/api-client');
      
      // Call the real API
      const blob = await services.profile.export(selectedType, selectedFormat);
      
      // Create download URL from blob
      const url = window.URL.createObjectURL(blob);
      setDownloadUrl(url);
      setExportStatus('ready');
    } catch (error) {
      console.error('[DataExport] Export error:', error);
      setError(error instanceof Error ? error.message : 'Export failed');
      setExportStatus('error');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownload = () => {
    if (downloadUrl) {
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `health-data-export-${selectedType}-${new Date().toISOString().split('T')[0]}.${selectedFormat}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const selectedOption = exportOptions.find(option => option.id === selectedType);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Data Export</h2>
        <p className="text-sm text-gray-600">Download your health data in various formats for backup or analysis.</p>
      </div>

      {/* Export Type Selection */}
      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Select Data to Export</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {exportOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = selectedType === option.id;
            
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setSelectedType(option.id)}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all text-left w-full ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg ${
                    isSelected ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{option.label}</h4>
                    <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                    <div className="mt-2">
                      <Badge variant="outline" className="text-xs">
                        {option.estimatedSize}
                      </Badge>
                    </div>
                    <div className="mt-2">
                      <p className="text-xs text-gray-500">Includes:</p>
                      <ul className="text-xs text-gray-600 mt-1">
                        {option.includes.map((item) => (
                          <li key={item} className="flex items-center">
                            <span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Format Selection */}
      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Export Format</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {formatOptions.map((format) => {
            const Icon = format.icon;
            const isSelected = selectedFormat === format.id;
            
            return (
              <button
                key={format.id}
                type="button"
                onClick={() => setSelectedFormat(format.id)}
                className={`p-4 border-2 rounded-lg cursor-pointer text-center transition-all w-full ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Icon className={`w-8 h-8 mx-auto mb-2 ${
                  isSelected ? 'text-blue-600' : 'text-gray-600'
                }`} />
                <h4 className="font-medium text-gray-900 text-sm">{format.label}</h4>
                <p className="text-xs text-gray-600 mt-1">{format.description}</p>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Export Summary */}
      {selectedOption && (
        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Export Summary</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-900">Selected Data:</span>
              <span className="text-sm text-gray-600">{selectedOption.label}</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-900">Format:</span>
              <span className="text-sm text-gray-600">{selectedFormat.toUpperCase()}</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-900">Estimated Size:</span>
              <span className="text-sm text-gray-600">{selectedOption.estimatedSize}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900">Generated:</span>
              <span className="text-sm text-gray-600">{new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </Card>
      )}

      {/* Export Actions */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Generate Export</h3>
            <p className="text-sm text-gray-600 mt-1">
              {exportStatus === 'idle' && 'Click the button below to generate your data export.'}
              {exportStatus === 'preparing' && 'Preparing your export... This may take a few minutes.'}
              {exportStatus === 'ready' && 'Your export is ready for download.'}
              {exportStatus === 'error' && 'There was an error generating your export.'}
            </p>
          </div>
          
          <div className="flex space-x-3">
            {exportStatus === 'ready' && (
              <Button onClick={handleDownload} className="bg-green-600 hover:bg-green-700">
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            )}
            
            {exportStatus !== 'ready' && (
              <Button 
                onClick={handleExport} 
                disabled={isExporting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isExporting ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Archive className="w-4 h-4 mr-2" />
                    Generate Export
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="w-4 h-4" />
            <p>{error}</p>
          </Alert>
        )}

        {exportStatus === 'ready' && (
          <Alert className="mt-4">
            <CheckCircle className="w-4 h-4" />
            <p>Your export has been generated successfully. Click the download button to save it to your device.</p>
          </Alert>
        )}
      </Card>

      {/* Important Notes */}
      <Card className="p-6 bg-yellow-50 border-yellow-200">
        <h3 className="text-lg font-medium text-yellow-800 mb-2">Important Notes</h3>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• Exports may take several minutes to generate depending on the amount of data</li>
          <li>• Large exports will be compressed to reduce download time</li>
          <li>• Keep your exported data secure and do not share it with unauthorized parties</li>
          <li>• Exports include all data up to the generation date and time</li>
          <li>• For technical support with exports, contact our support team</li>
        </ul>
      </Card>
    </div>
  );
}

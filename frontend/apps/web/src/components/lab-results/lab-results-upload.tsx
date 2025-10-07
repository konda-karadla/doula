'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Upload, 
  FileText, 
  X, 
  CheckCircle, 
  AlertCircle,
  Loader2
} from 'lucide-react'

interface UploadedFile {
  file: File
  id: string
  progress: number
  status: 'uploading' | 'processing' | 'completed' | 'error'
  error?: string
}

interface LabResultsUploadProps {
  onClose: () => void
}

export function LabResultsUpload({ onClose }: LabResultsUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: UploadedFile[] = acceptedFiles.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      progress: 0,
      status: 'uploading' as const
    }))
    
    setUploadedFiles(prev => [...prev, ...newFiles])
    
    // Simulate upload process
    newFiles.forEach(uploadedFile => {
      simulateUpload(uploadedFile.id)
    })
  }, [])

  const simulateUpload = (fileId: string) => {
    setIsUploading(true)
    
    // Simulate upload progress
    let progress = 0
    const interval = setInterval(() => {
      progress += Math.random() * 30
      if (progress >= 100) {
        progress = 100
        clearInterval(interval)
        
        // Simulate processing
        setTimeout(() => {
          setUploadedFiles(prev => 
            prev.map(f => 
              f.id === fileId 
                ? { ...f, progress: 100, status: 'completed' as const }
                : f
            )
          )
          setIsUploading(false)
        }, 1000)
      }
      
      setUploadedFiles(prev => 
        prev.map(f => 
          f.id === fileId 
            ? { ...f, progress }
            : f
        )
      )
    }, 200)
  }

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId))
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg']
    },
    multiple: true
  })

  const completedFiles = uploadedFiles.filter(f => f.status === 'completed').length
  const totalFiles = uploadedFiles.length

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Upload Lab Results</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Upload Area */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive 
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20' 
                : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-950/10'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {isDragActive ? 'Drop files here' : 'Upload Lab Results'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Drag and drop your lab result files here, or click to select files
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Supports PDF, PNG, JPG files up to 10MB each
            </p>
          </div>

          {/* Upload Progress */}
          {uploadedFiles.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">Upload Progress</h4>
                <span className="text-sm text-muted-foreground">
                  {completedFiles} of {totalFiles} completed
                </span>
              </div>
              
              <div className="space-y-3">
                {uploadedFiles.map((uploadedFile) => (
                  <div key={uploadedFile.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <FileText className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium truncate max-w-xs">
                          {uploadedFile.file.name}
                        </span>
                        <span className="text-xs text-gray-500">
                          {(uploadedFile.file.size / 1024 / 1024).toFixed(1)} MB
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {uploadedFile.status === 'uploading' && (
                          <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                        )}
                        {uploadedFile.status === 'completed' && (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        )}
                        {uploadedFile.status === 'error' && (
                          <AlertCircle className="w-4 h-4 text-red-500" />
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-6 h-6"
                          onClick={() => removeFile(uploadedFile.id)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <Progress 
                      value={uploadedFile.progress} 
                      className="h-2"
                    />
                    
                    {uploadedFile.status === 'error' && uploadedFile.error && (
                      <Alert variant="destructive">
                        <AlertCircle className="w-4 h-4" />
                        <AlertDescription>{uploadedFile.error}</AlertDescription>
                      </Alert>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Success Message */}
          {completedFiles > 0 && completedFiles === totalFiles && (
            <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <AlertDescription className="text-green-800 dark:text-green-400">
                ✅ Successfully uploaded {completedFiles} file{completedFiles > 1 ? 's' : ''}! 
                <br />
                Your lab results are being processed and will appear in your results list within a few minutes.
                <br />
                <span className="text-sm">You can close this dialog and continue using the app.</span>
              </AlertDescription>
            </Alert>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            {uploadedFiles.length > 0 && (
            <Button 
              onClick={() => {
                console.log('Processing uploaded files:', uploadedFiles)
                // Simulate processing completion
                setTimeout(() => {
                  alert(`Successfully uploaded ${completedFiles} file${completedFiles > 1 ? 's' : ''}! Your lab results are being processed and will appear in the list shortly.`)
                  onClose()
                }, 1000)
              }}
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                'Complete Upload'
              )}
            </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

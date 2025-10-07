'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { X, Search, Filter, Calendar } from 'lucide-react'

interface LabResultsFiltersProps {
  onClose: () => void
  onApplyFilters?: (filters: {
    search?: string
    status?: string[]
    dateRange?: { from: string; to: string }
    biomarkerCount?: { min: string; max: string }
  }) => void
}

export function LabResultsFilters({ onClose, onApplyFilters }: LabResultsFiltersProps) {
  const [filters, setFilters] = useState({
    search: '',
    status: [] as string[],
    dateRange: {
      from: '',
      to: ''
    },
    biomarkerCount: {
      min: '',
      max: ''
    }
  })

  const statusOptions = [
    { value: 'processed', label: 'Processed', count: 3 },
    { value: 'processing', label: 'Processing', count: 1 },
    { value: 'pending', label: 'Pending', count: 0 },
    { value: 'error', label: 'Error', count: 0 }
  ]

  const toggleStatus = (status: string) => {
    setFilters(prev => ({
      ...prev,
      status: prev.status.includes(status)
        ? prev.status.filter(s => s !== status)
        : [...prev.status, status]
    }))
  }

  const clearFilters = () => {
    setFilters({
      search: '',
      status: [],
      dateRange: { from: '', to: '' },
      biomarkerCount: { min: '', max: '' }
    })
  }

  const hasActiveFilters = filters.search || filters.status.length > 0 || 
    filters.dateRange.from || filters.dateRange.to || 
    filters.biomarkerCount.min || filters.biomarkerCount.max

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center">
          <Filter className="w-4 h-4 mr-2" />
          Filters
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Search */}
        <div className="space-y-2">
          <Label htmlFor="search">Search</Label>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Search lab results..."
              className="pl-10"
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            />
          </div>
        </div>

        {/* Status Filter */}
        <div className="space-y-3">
          <Label>Status</Label>
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((option) => (
              <Badge
                key={option.value}
                variant={filters.status.includes(option.value) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => toggleStatus(option.value)}
              >
                {option.label} ({option.count})
              </Badge>
            ))}
          </div>
        </div>

        {/* Date Range */}
        <div className="space-y-3">
          <Label className="flex items-center">
            <Calendar className="w-4 h-4 mr-2" />
            Date Range
          </Label>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="from-date">From</Label>
              <Input
                id="from-date"
                type="date"
                value={filters.dateRange.from}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  dateRange: { ...prev.dateRange, from: e.target.value }
                }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="to-date">To</Label>
              <Input
                id="to-date"
                type="date"
                value={filters.dateRange.to}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  dateRange: { ...prev.dateRange, to: e.target.value }
                }))}
              />
            </div>
          </div>
        </div>

        {/* Biomarker Count */}
        <div className="space-y-3">
          <Label>Biomarker Count</Label>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="min-biomarkers">Min</Label>
              <Input
                id="min-biomarkers"
                type="number"
                placeholder="0"
                value={filters.biomarkerCount.min}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  biomarkerCount: { ...prev.biomarkerCount, min: e.target.value }
                }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max-biomarkers">Max</Label>
              <Input
                id="max-biomarkers"
                type="number"
                placeholder="20"
                value={filters.biomarkerCount.max}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  biomarkerCount: { ...prev.biomarkerCount, max: e.target.value }
                }))}
              />
            </div>
          </div>
        </div>

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="space-y-2">
            <Label>Active Filters</Label>
            <div className="flex flex-wrap gap-2">
              {filters.search && (
                <Badge variant="secondary">
                  Search: "{filters.search}"
                </Badge>
              )}
              {filters.status.map(status => (
                <Badge key={status} variant="secondary">
                  Status: {status}
                </Badge>
              ))}
              {filters.dateRange.from && (
                <Badge variant="secondary">
                  From: {filters.dateRange.from}
                </Badge>
              )}
              {filters.dateRange.to && (
                <Badge variant="secondary">
                  To: {filters.dateRange.to}
                </Badge>
              )}
              {filters.biomarkerCount.min && (
                <Badge variant="secondary">
                  Min biomarkers: {filters.biomarkerCount.min}
                </Badge>
              )}
              {filters.biomarkerCount.max && (
                <Badge variant="secondary">
                  Max biomarkers: {filters.biomarkerCount.max}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={clearFilters}>
            Clear All
          </Button>
          <div className="space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={() => {
                console.log('Applying filters:', filters)
                onApplyFilters?.(filters)
                onClose()
              }}
            >
              Apply Filters
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

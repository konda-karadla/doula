'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { X, Search, Filter, Calendar, Target } from 'lucide-react'

interface ActionPlanFiltersProps {
  onClose: () => void
  onApplyFilters?: (filters: {
    search?: string
    status?: string[]
    category?: string[]
    priority?: string[]
    dateRange?: { from: string; to: string }
    progressRange?: { min: string; max: string }
  }) => void
}

export function ActionPlanFilters({ onClose, onApplyFilters }: ActionPlanFiltersProps) {
  const [filters, setFilters] = useState({
    search: '',
    status: [] as string[],
    category: [] as string[],
    priority: [] as string[],
    dateRange: {
      from: '',
      to: ''
    },
    progressRange: {
      min: '',
      max: ''
    }
  })

  const statusOptions = [
    { value: 'active', label: 'Active', count: 2 },
    { value: 'completed', label: 'Completed', count: 1 },
    { value: 'paused', label: 'Paused', count: 1 },
    { value: 'draft', label: 'Draft', count: 0 }
  ]

  const categoryOptions = [
    { value: 'nutrition', label: '🥗 Nutrition', count: 1 },
    { value: 'exercise', label: '🏃 Exercise', count: 1 },
    { value: 'lifestyle', label: '🏠 Lifestyle', count: 1 },
    { value: 'medical', label: '🏥 Medical', count: 0 },
    { value: 'wellness', label: '🧘 Wellness', count: 1 }
  ]

  const priorityOptions = [
    { value: 'high', label: 'High Priority', count: 1 },
    { value: 'medium', label: 'Medium Priority', count: 2 },
    { value: 'low', label: 'Low Priority', count: 1 }
  ]

  const toggleFilter = (filterType: 'status' | 'category' | 'priority', value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: prev[filterType].includes(value)
        ? prev[filterType].filter(item => item !== value)
        : [...prev[filterType], value]
    }))
  }

  const clearFilters = () => {
    setFilters({
      search: '',
      status: [],
      category: [],
      priority: [],
      dateRange: { from: '', to: '' },
      progressRange: { min: '', max: '' }
    })
  }

  const hasActiveFilters = filters.search || 
    filters.status.length > 0 || 
    filters.category.length > 0 || 
    filters.priority.length > 0 ||
    filters.dateRange.from || 
    filters.dateRange.to || 
    filters.progressRange.min || 
    filters.progressRange.max

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center">
          <Filter className="w-4 h-4 mr-2" />
          Filter Action Plans
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
              placeholder="Search action plans..."
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
                onClick={() => toggleFilter('status', option.value)}
              >
                {option.label} ({option.count})
              </Badge>
            ))}
          </div>
        </div>

        {/* Category Filter */}
        <div className="space-y-3">
          <Label>Category</Label>
          <div className="flex flex-wrap gap-2">
            {categoryOptions.map((option) => (
              <Badge
                key={option.value}
                variant={filters.category.includes(option.value) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => toggleFilter('category', option.value)}
              >
                {option.label} ({option.count})
              </Badge>
            ))}
          </div>
        </div>

        {/* Priority Filter */}
        <div className="space-y-3">
          <Label>Priority</Label>
          <div className="flex flex-wrap gap-2">
            {priorityOptions.map((option) => (
              <Badge
                key={option.value}
                variant={filters.priority.includes(option.value) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => toggleFilter('priority', option.value)}
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
            Created Date Range
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

        {/* Progress Range */}
        <div className="space-y-3">
          <Label className="flex items-center">
            <Target className="w-4 h-4 mr-2" />
            Progress Range
          </Label>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="min-progress">Min Progress</Label>
              <Input
                id="min-progress"
                type="number"
                placeholder="0"
                min="0"
                max="100"
                value={filters.progressRange.min}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  progressRange: { ...prev.progressRange, min: e.target.value }
                }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max-progress">Max Progress</Label>
              <Input
                id="max-progress"
                type="number"
                placeholder="100"
                min="0"
                max="100"
                value={filters.progressRange.max}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  progressRange: { ...prev.progressRange, max: e.target.value }
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
                  Search: &quot;{filters.search}&quot;
                </Badge>
              )}
              {filters.status.map(status => (
                <Badge key={status} variant="secondary">
                  Status: {status}
                </Badge>
              ))}
              {filters.category.map(category => (
                <Badge key={category} variant="secondary">
                  Category: {category}
                </Badge>
              ))}
              {filters.priority.map(priority => (
                <Badge key={priority} variant="secondary">
                  Priority: {priority}
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
              {filters.progressRange.min && (
                <Badge variant="secondary">
                  Min progress: {filters.progressRange.min}%
                </Badge>
              )}
              {filters.progressRange.max && (
                <Badge variant="secondary">
                  Max progress: {filters.progressRange.max}%
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

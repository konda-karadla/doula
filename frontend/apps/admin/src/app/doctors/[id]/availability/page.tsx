'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAdminDoctor, useSetAvailability } from '@/hooks/use-admin-doctors';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Plus, X, Clock } from 'lucide-react';
import type { CreateAvailabilityRequest } from '@health-platform/types';

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

export default function DoctorAvailabilityPage() {
  const router = useRouter();
  const params = useParams();
  const doctorId = params.id as string;

  const { data: doctor, isLoading } = useAdminDoctor(doctorId);
  const setAvailability = useSetAvailability();

  const [slots, setSlots] = useState<CreateAvailabilityRequest[]>([
    { dayOfWeek: 1, startTime: '09:00', endTime: '17:00' },
  ]);

  const [error, setError] = useState<string>('');

  // Initialize with existing availability
  useEffect(() => {
    if (doctor?.availabilitySlots && doctor.availabilitySlots.length > 0) {
      setSlots(
        doctor.availabilitySlots.map((slot) => ({
          dayOfWeek: slot.dayOfWeek,
          startTime: slot.startTime,
          endTime: slot.endTime,
        }))
      );
    }
  }, [doctor]);

  const addSlot = () => {
    setSlots([...slots, { dayOfWeek: 1, startTime: '09:00', endTime: '17:00' }]);
  };

  const removeSlot = (index: number) => {
    setSlots(slots.filter((_, i) => i !== index));
  };

  const updateSlot = (index: number, field: keyof CreateAvailabilityRequest, value: any) => {
    const updated = [...slots];
    updated[index] = { ...updated[index], [field]: value };
    setSlots(updated);
  };

  const validateSlots = (): boolean => {
    // Check if all slots have valid times
    for (const slot of slots) {
      if (slot.startTime >= slot.endTime) {
        setError('End time must be after start time for all slots');
        return false;
      }
    }

    // Check for overlapping slots on same day
    for (let i = 0; i < slots.length; i++) {
      for (let j = i + 1; j < slots.length; j++) {
        if (slots[i].dayOfWeek === slots[j].dayOfWeek) {
          const start1 = slots[i].startTime;
          const end1 = slots[i].endTime;
          const start2 = slots[j].startTime;
          const end2 = slots[j].endTime;

          if ((start1 < end2 && end1 > start2) || (start2 < end1 && end2 > start1)) {
            setError(`Overlapping time slots found for ${DAYS_OF_WEEK[slots[i].dayOfWeek].label}`);
            return false;
          }
        }
      }
    }

    setError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (slots.length === 0) {
      setError('Please add at least one availability slot');
      return;
    }

    if (!validateSlots()) {
      return;
    }

    try {
      await setAvailability.mutateAsync({
        id: doctorId,
        availability: slots,
      });

      router.push('/doctors');
    } catch (error: any) {
      console.error('Failed to set availability:', error);
      setError(error.response?.data?.message || 'Failed to set availability. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading doctor details...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => router.push('/doctors')}
          className="mb-4 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Doctors
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Set Availability</h1>
          <p className="text-gray-600 mt-1">
            Configure weekly schedule for {doctor?.name}
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <Card className="p-6 space-y-6">
          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex gap-3">
              <Clock className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900">
                  Setting Weekly Availability Schedule
                </p>
                <p className="text-sm text-blue-700 mt-1">
                  Add time slots for each day of the week. Patients will only be able to book
                  consultations during these times.
                </p>
              </div>
            </div>
          </div>

          {/* Availability Slots */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Weekly Schedule ({slots.length} slot{slots.length !== 1 ? 's' : ''})
              </h2>
              <Button type="button" onClick={addSlot} size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-1" />
                Add Time Slot
              </Button>
            </div>

            {slots.map((slot, index) => (
              <Card key={index} className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-7 gap-4 items-end">
                  {/* Day of Week */}
                  <div className="md:col-span-2">
                    <Label htmlFor={`day-${index}`}>Day</Label>
                    <select
                      id={`day-${index}`}
                      value={slot.dayOfWeek}
                      onChange={(e) => updateSlot(index, 'dayOfWeek', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {DAYS_OF_WEEK.map((day) => (
                        <option key={day.value} value={day.value}>
                          {day.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Start Time */}
                  <div className="md:col-span-2">
                    <Label htmlFor={`start-${index}`}>Start Time</Label>
                    <Input
                      id={`start-${index}`}
                      type="time"
                      value={slot.startTime}
                      onChange={(e) => updateSlot(index, 'startTime', e.target.value)}
                    />
                  </div>

                  {/* End Time */}
                  <div className="md:col-span-2">
                    <Label htmlFor={`end-${index}`}>End Time</Label>
                    <Input
                      id={`end-${index}`}
                      type="time"
                      value={slot.endTime}
                      onChange={(e) => updateSlot(index, 'endTime', e.target.value)}
                    />
                  </div>

                  {/* Remove Button */}
                  <div className="md:col-span-1">
                    {slots.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => removeSlot(index)}
                        size="sm"
                        variant="ghost"
                        className="w-full text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Time Summary */}
                <div className="mt-2 text-sm text-gray-500">
                  {DAYS_OF_WEEK[slot.dayOfWeek].label}: {slot.startTime} - {slot.endTime}
                </div>
              </Card>
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Preview */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Weekly Schedule Preview</h3>
            <div className="grid grid-cols-7 gap-2">
              {DAYS_OF_WEEK.map((day) => {
                const daySlots = slots.filter((s) => s.dayOfWeek === day.value);
                return (
                  <div key={day.value} className="text-center">
                    <div className="text-xs font-medium text-gray-600 mb-1">
                      {day.label.slice(0, 3)}
                    </div>
                    <div className="text-xs space-y-1">
                      {daySlots.length > 0 ? (
                        daySlots.map((slot, i) => (
                          <div key={i} className="bg-blue-100 text-blue-800 rounded px-1 py-0.5">
                            {slot.startTime.slice(0, 5)} - {slot.endTime.slice(0, 5)}
                          </div>
                        ))
                      ) : (
                        <div className="text-gray-400">-</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/doctors')}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={setAvailability.isPending}>
              {setAvailability.isPending ? 'Saving...' : 'Save Availability'}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}


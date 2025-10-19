import { Share, Alert } from 'react-native';
import * as Sharing from 'expo-sharing';

/**
 * Sharing utilities for mobile app
 * Share content via native share sheet
 */

export const shareUtils = {
  /**
   * Share text content
   */
  async shareText(title: string, message: string): Promise<boolean> {
    try {
      const result = await Share.share({
        title,
        message,
      });

      if (result.action === Share.sharedAction) {
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error sharing text:', error);
      Alert.alert('Error', 'Failed to share content');
      return false;
    }
  },

  /**
   * Share lab result information
   */
  async shareLabResult(fileName: string, uploadedDate: string, status: string): Promise<void> {
    const message = `
🔬 Lab Result: ${fileName}

📅 Uploaded: ${uploadedDate}
📊 Status: ${status}

Shared from Health Platform Mobile
    `.trim();

    await this.shareText('Lab Result', message);
  },

  /**
   * Share health score
   */
  async shareHealthScore(score: number, status: string): Promise<void> {
    const message = `
💪 My Health Score: ${score}/100

Status: ${status}

Track your health with Health Platform Mobile!
    `.trim();

    await this.shareText('Health Score', message);
  },

  /**
   * Share action plan progress
   */
  async shareActionPlan(title: string, completedItems: number, totalItems: number): Promise<void> {
    const percentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
    const message = `
📋 Action Plan: ${title}

Progress: ${completedItems}/${totalItems} completed (${percentage}%)

Stay healthy with Health Platform!
    `.trim();

    await this.shareText('Action Plan', message);
  },

  /**
   * Check if sharing is available
   */
  async isSharingAvailable(): Promise<boolean> {
    return await Sharing.isAvailableAsync();
  },
};


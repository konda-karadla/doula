import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { readFileSync } from 'fs';
import { join } from 'path';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('email.host', 'smtp.gmail.com'),
      port: this.configService.get<number>('email.port', 587),
      secure: false, // true for 465, false for other ports
      auth: {
        user: this.configService.get<string>('email.user'),
        pass: this.configService.get<string>('email.password'),
      },
    });
  }

  /**
   * Send welcome email to new user
   */
  async sendWelcomeEmail(email: string, username: string): Promise<void> {
    const template = this.loadTemplate('welcome');
    const html = template
      .replace('{{username}}', username)
      .replace('{{email}}', email);

    await this.sendEmail({
      to: email,
      subject: 'Welcome to Health Platform! 🎉',
      html,
    });
  }

  /**
   * Send email when lab result is ready
   */
  async sendLabResultReadyEmail(
    email: string,
    username: string,
    labResultId: string,
  ): Promise<void> {
    const template = this.loadTemplate('lab-ready');
    const dashboardUrl = this.configService.get<string>(
      'frontendUrl',
      'http://localhost:3001',
    );
    const labUrl = `${dashboardUrl}/lab-results/${labResultId}`;

    const html = template
      .replace('{{username}}', username)
      .replace('{{labUrl}}', labUrl);

    await this.sendEmail({
      to: email,
      subject: 'Your Lab Results Are Ready 🧪',
      html,
    });
  }

  /**
   * Send email when new insights are generated
   */
  async sendInsightReadyEmail(
    email: string,
    username: string,
    insightCount: number,
  ): Promise<void> {
    const template = this.loadTemplate('insight-ready');
    const dashboardUrl = this.configService.get<string>(
      'frontendUrl',
      'http://localhost:3001',
    );

    const html = template
      .replace('{{username}}', username)
      .replace('{{insightCount}}', insightCount.toString())
      .replace('{{dashboardUrl}}', dashboardUrl);

    await this.sendEmail({
      to: email,
      subject: `You Have ${insightCount} New Health Insights 💡`,
      html,
    });
  }

  /**
   * Send reminder for action items due soon
   */
  async sendActionItemDueEmail(
    email: string,
    username: string,
    actionPlanTitle: string,
    dueItemsCount: number,
  ): Promise<void> {
    const template = this.loadTemplate('action-due');
    const dashboardUrl = this.configService.get<string>(
      'frontendUrl',
      'http://localhost:3001',
    );

    const html = template
      .replace('{{username}}', username)
      .replace('{{actionPlanTitle}}', actionPlanTitle)
      .replace('{{dueItemsCount}}', dueItemsCount.toString())
      .replace('{{dashboardUrl}}', dashboardUrl);

    await this.sendEmail({
      to: email,
      subject: `Action Items Due Soon: ${actionPlanTitle} 📋`,
      html,
    });
  }

  /**
   * Generic email sending method
   */
  private async sendEmail(options: {
    to: string;
    subject: string;
    html: string;
  }): Promise<void> {
    try {
      const from = this.configService.get<string>(
        'email.from',
        'Health Platform <noreply@healthplatform.com>',
      );

      await this.transporter.sendMail({
        from,
        to: options.to,
        subject: options.subject,
        html: options.html,
      });

      console.log(`✅ Email sent to ${options.to}: ${options.subject}`);
    } catch (error) {
      console.error(`❌ Failed to send email to ${options.to}:`, error);
      // Don't throw error - email failure shouldn't break app
      // TODO: Add to retry queue in production
    }
  }

  /**
   * Load email template from file
   */
  private loadTemplate(templateName: string): string {
    try {
      const templatePath = join(
        __dirname,
        '..',
        '..',
        'src',
        'notifications',
        'templates',
        `${templateName}.html`,
      );
      return readFileSync(templatePath, 'utf-8');
    } catch (error) {
      console.error(`Failed to load template ${templateName}:`, error);
      // Fallback to basic template
      return this.getBasicTemplate(templateName);
    }
  }

  /**
   * Basic fallback template if file not found
   */
  private getBasicTemplate(templateName: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head><meta charset="utf-8"></head>
        <body style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Health Platform Notification</h2>
          <p>You have a new notification from Health Platform.</p>
          <p>Template: ${templateName}</p>
        </body>
      </html>
    `;
  }
}


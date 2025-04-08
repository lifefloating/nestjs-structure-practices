import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs/promises';
import * as path from 'path';
import mjml from 'mjml';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class MailerService {
  private readonly transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailerService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly i18n: I18nService,
  ) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('MAIL_HOST'),
      port: this.configService.get('MAIL_PORT'),
      secure: this.configService.get('MAIL_SECURE') === 'true',
      auth: {
        user: this.configService.get('MAIL_USER'),
        pass: this.configService.get('MAIL_PASSWORD'),
      },
    });
  }

  private async renderTemplate(
    templateName: string,
    context: Record<string, any>,
    lang: string = 'en',
  ): Promise<string> {
    try {
      // Read MJML template
      const templatePath = path.join(__dirname, '..', 'i18n', 'emails', `${templateName}.mjml`);
      let mjmlTemplate = await fs.readFile(templatePath, 'utf8');

      // Replace template variables with translations
      const translations = await this.getEmailTranslations(templateName, lang, context);

      // Replace all the translation placeholders in the template
      Object.entries(translations).forEach(([key, value]) => {
        const regex = new RegExp(
          `{\\{\\s*'emails\\.${templateName}\\.${key}'\\s*\\|\\s*translate(?::\\s*\\{.*?\\})?\\s*\\}\\}`,
          'g',
        );
        mjmlTemplate = mjmlTemplate.replace(regex, value);
      });

      // Replace context variables
      Object.entries(context).forEach(([key, value]) => {
        const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g');
        mjmlTemplate = mjmlTemplate.replace(regex, String(value));
      });

      // Convert MJML to HTML
      const { html } = mjml(mjmlTemplate);
      return html;
    } catch (error) {
      this.logger.error(`Failed to render template ${templateName}`, error);
      throw error;
    }
  }

  private async getEmailTranslations(
    templateName: string,
    lang: string,
    context: Record<string, any>,
  ): Promise<Record<string, string>> {
    const keys = ['title', 'greeting', 'message', 'button', 'footer'];

    const translations: Record<string, string> = {};

    for (const key of keys) {
      translations[key] = await this.i18n.translate(`emails.${templateName}.${key}`, {
        lang,
        args: context,
      });
    }

    return translations;
  }

  async sendVerificationEmail(
    email: string,
    verificationCode: string,
    lang: string = 'en',
  ): Promise<void> {
    try {
      const context = {
        verificationCode,
        verificationUrl: `${this.configService.get('APP_URL')}/verify?code=${verificationCode}`,
        siteUrl: this.configService.get('APP_URL'),
      };

      const html = await this.renderTemplate('verification', context, lang);

      const subject = await this.i18n.translate('emails.verification.subject', { lang });

      await this.transporter.sendMail({
        from: this.configService.get('MAIL_FROM'),
        to: email,
        subject,
        html,
      });

      this.logger.log(`Verification email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send verification email to ${email}`, error);
      throw error;
    }
  }

  async sendWelcomeEmail(email: string, name: string, lang: string = 'en'): Promise<void> {
    try {
      const context = {
        name,
        siteUrl: this.configService.get('APP_URL'),
      };

      const html = await this.renderTemplate('welcome', context, lang);

      const subject = await this.i18n.translate('emails.welcome.subject', { lang });

      await this.transporter.sendMail({
        from: this.configService.get('MAIL_FROM'),
        to: email,
        subject,
        html,
      });

      this.logger.log(`Welcome email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send welcome email to ${email}`, error);
      throw error;
    }
  }

  async sendForgotPasswordEmail(
    email: string,
    resetToken: string,
    expireTime: number,
    lang: string = 'en',
  ): Promise<void> {
    try {
      const context = {
        expireTime,
        resetUrl: `${this.configService.get('APP_URL')}/reset-password?token=${resetToken}`,
        siteUrl: this.configService.get('APP_URL'),
      };

      const html = await this.renderTemplate('forgot-password', context, lang);

      const subject = await this.i18n.translate('emails.forgot-password.subject', { lang });

      await this.transporter.sendMail({
        from: this.configService.get('MAIL_FROM'),
        to: email,
        subject,
        html,
      });

      this.logger.log(`Forgot password email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send forgot password email to ${email}`, error);
      throw error;
    }
  }
}

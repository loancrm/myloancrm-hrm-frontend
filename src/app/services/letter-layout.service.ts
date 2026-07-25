import { Injectable } from '@angular/core';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export interface HeaderFooterStyle {
  /** visual pattern */
  pattern?: 'split' | 'centered' | 'logo-left' | 'minimal';
  align?: 'left' | 'center' | 'right';
  accentColor?: string;
  showLogo?: boolean;
  showName?: boolean;
  showAddress?: boolean;
  showPhone?: boolean;
  showEmail?: boolean;
  showWebsite?: boolean;
  showBorder?: boolean;
}

export interface LetterLayout {
  pattern?: string;
  showHeader?: boolean;
  showFooter?: boolean;
  watermarkEnabled?: boolean;
  /** text | logo | both */
  watermarkType?: 'text' | 'logo' | 'both';
  watermarkText?: string;
  /** diagonal (legacy default) | horizontal | vertical */
  watermarkOrientation?: 'diagonal' | 'horizontal' | 'vertical';
  /** Structured UI options (preferred) */
  headerStyle?: HeaderFooterStyle;
  footerStyle?: HeaderFooterStyle;
  /** Legacy raw HTML (kept for old templates) */
  headerHtml?: string;
  footerHtml?: string;
}

export const DEFAULT_HEADER_STYLE: HeaderFooterStyle = {
  pattern: 'split',
  align: 'right',
  accentColor: '#535ab4',
  showLogo: true,
  showName: true,
  showAddress: true,
  showPhone: true,
  showEmail: true,
  showWebsite: false,
  showBorder: true,
};

export const DEFAULT_FOOTER_STYLE: HeaderFooterStyle = {
  pattern: 'minimal',
  align: 'center',
  accentColor: '#535ab4',
  showLogo: false,
  showName: true,
  showAddress: true,
  showPhone: true,
  showEmail: false,
  showWebsite: false,
  showBorder: true,
};

/**
 * Applied to default / legacy letters that have no saved layout:
 * letterhead + footer + logo watermark.
 */
export const DEFAULT_LETTER_LAYOUT: LetterLayout = {
  pattern: 'default',
  showHeader: true,
  showFooter: true,
  watermarkEnabled: true,
  watermarkType: 'logo',
  watermarkText: '{{COMPANY_NAME}}',
  watermarkOrientation: 'diagonal',
  headerStyle: { ...DEFAULT_HEADER_STYLE },
  footerStyle: { ...DEFAULT_FOOTER_STYLE },
};

export const HEADER_PATTERN_OPTIONS = [
  { label: 'Default (logo left, text right)', value: 'split' },
  { label: 'Logo left, text left', value: 'logo-left' },
  { label: 'Centered', value: 'centered' },
  { label: 'Text only (centered)', value: 'minimal' },
];

export const FOOTER_PATTERN_OPTIONS = [
  { label: 'Default (name | address | phone)', value: 'minimal' },
  { label: 'Centered stacked', value: 'centered' },
  { label: 'Logo + short info', value: 'logo-left' },
  { label: 'Split (logo left / info right)', value: 'split' },
];

export const ALIGN_OPTIONS = [
  { label: 'Left', value: 'left' },
  { label: 'Center', value: 'center' },
  { label: 'Right', value: 'right' },
];

export const ACCENT_COLOR_OPTIONS = [
  { label: 'HRMS Purple', value: '#535ab4' },
  { label: 'Navy Blue', value: '#1e3a5f' },
  { label: 'Teal', value: '#0f766e' },
  { label: 'Charcoal', value: '#333333' },
  { label: 'Maroon', value: '#7f1d1d' },
  { label: 'Forest Green', value: '#166534' },
];

/** @deprecated kept for legacy templates only */
export const DEFAULT_LETTER_HEADER = '';
/** @deprecated kept for legacy templates only */
export const DEFAULT_LETTER_FOOTER = '';

export const TEMPLATE_PATTERNS: {
  label: string;
  value: string;
  html: string;
  layout?: Partial<LetterLayout>;
}[] = [
  {
    label: 'Classic Formal',
    value: 'classic',
    layout: {
      showHeader: true,
      showFooter: true,
      watermarkEnabled: true,
      watermarkType: 'text',
      watermarkText: '{{COMPANY_NAME}}',
      headerStyle: { ...DEFAULT_HEADER_STYLE },
      footerStyle: { ...DEFAULT_FOOTER_STYLE },
    },
    html: `
<p style="text-align:right;">Date: {{CREATED_DATE}}</p>
<p><strong>To,</strong><br>{{EMPLOYEE_NAME}}<br>{{EMPLOYEE_CITY}}, {{EMPLOYEE_STATE}}</p>
<p><strong>Subject: Offer of Employment – {{DESIGNATION}}</strong></p>
<p>Dear {{EMPLOYEE_NAME}},</p>
<p>We are pleased to offer you the position of <strong>{{DESIGNATION}}</strong> at <strong>{{COMPANY_NAME}}</strong>, with a joining date of <strong>{{JOINING_DATE}}</strong>.</p>
<p>Your annual CTC will be <strong>{{SALARY}}</strong>.</p>
<p>Please sign and return a copy of this letter as your acceptance.</p>
<p>Warm regards,<br><strong>{{COMPANY_NAME}}</strong><br>HR Department<br>{{HR_EMAIL}}</p>
`.trim(),
  },
  {
    label: 'Modern with Salary Table',
    value: 'modern-table',
    layout: {
      showHeader: true,
      showFooter: true,
      watermarkEnabled: true,
      watermarkType: 'text',
      watermarkText: '{{COMPANY_NAME}}',
      headerStyle: { ...DEFAULT_HEADER_STYLE, pattern: 'centered', align: 'center' },
      footerStyle: { ...DEFAULT_FOOTER_STYLE },
    },
    html: `
<p style="text-align:right;">Date: {{CREATED_DATE}}</p>
<p>Dear <strong>{{EMPLOYEE_NAME}}</strong>,</p>
<p>Congratulations! We are delighted to offer you the role of <strong>{{DESIGNATION}}</strong> at {{COMPANY_NAME}}.</p>
<figure class="table">
  <table style="width:100%;border-collapse:collapse;">
    <thead>
      <tr>
        <th style="border:1px solid #535ab4;background:#eceaf8;padding:8px;text-align:left;">Particulars</th>
        <th style="border:1px solid #535ab4;background:#eceaf8;padding:8px;text-align:left;">Details</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="border:1px solid #535ab4;padding:8px;">Employee Name</td>
        <td style="border:1px solid #535ab4;padding:8px;">{{EMPLOYEE_NAME}}</td>
      </tr>
      <tr>
        <td style="border:1px solid #535ab4;padding:8px;">Designation</td>
        <td style="border:1px solid #535ab4;padding:8px;">{{DESIGNATION}}</td>
      </tr>
      <tr>
        <td style="border:1px solid #535ab4;padding:8px;">Date of Joining</td>
        <td style="border:1px solid #535ab4;padding:8px;">{{JOINING_DATE}}</td>
      </tr>
      <tr>
        <td style="border:1px solid #535ab4;padding:8px;">Annual CTC</td>
        <td style="border:1px solid #535ab4;padding:8px;">{{SALARY}}</td>
      </tr>
    </tbody>
  </table>
</figure>
<p>We look forward to welcoming you to the team.</p>
<p>Best regards,<br>{{COMPANY_NAME}} HR<br>{{HR_EMAIL}}</p>
`.trim(),
  },
  {
    label: 'Compact Letter',
    value: 'compact',
    layout: {
      showHeader: true,
      showFooter: false,
      watermarkEnabled: false,
      headerStyle: { ...DEFAULT_HEADER_STYLE, pattern: 'minimal', showLogo: false },
      footerStyle: { ...DEFAULT_FOOTER_STYLE },
    },
    html: `
<p><strong>{{COMPANY_NAME}}</strong></p>
<p>Offer Letter – {{CREATED_DATE}}</p>
<p>Dear {{EMPLOYEE_NAME}},</p>
<p>You are offered the position of {{DESIGNATION}} effective {{JOINING_DATE}} with CTC {{SALARY}}.</p>
<p>Regards,<br>HR Team<br>{{HR_EMAIL}}</p>
`.trim(),
  },
];

export const SALARY_TABLE_HTML = `
<figure class="table">
  <table style="width:100%;border-collapse:collapse;margin:12px 0;">
    <thead>
      <tr>
        <th style="border:1px solid #333;background:#f3f3f3;padding:8px;text-align:left;">Component</th>
        <th style="border:1px solid #333;background:#f3f3f3;padding:8px;text-align:left;">Amount / Value</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="border:1px solid #333;padding:8px;">Designation</td>
        <td style="border:1px solid #333;padding:8px;">{{DESIGNATION}}</td>
      </tr>
      <tr>
        <td style="border:1px solid #333;padding:8px;">Joining Date</td>
        <td style="border:1px solid #333;padding:8px;">{{JOINING_DATE}}</td>
      </tr>
      <tr>
        <td style="border:1px solid #333;padding:8px;">Annual CTC</td>
        <td style="border:1px solid #333;padding:8px;">{{SALARY}}</td>
      </tr>
      <tr>
        <td style="border:1px solid #333;padding:8px;">Total Salary</td>
        <td style="border:1px solid #333;padding:8px;">{{TOTAL_SALARY}}</td>
      </tr>
    </tbody>
  </table>
</figure>
`.trim();

@Injectable({
  providedIn: 'root',
})
export class LetterLayoutService {
  parseLayout(raw: any): LetterLayout | null {
    // Default letters have no saved layout — give them letterhead,
    // footer and logo watermark instead of a bare body.
    if (!raw) {
      return { ...DEFAULT_LETTER_LAYOUT };
    }
    if (typeof raw === 'object') {
      return raw as LetterLayout;
    }
    try {
      return JSON.parse(raw) as LetterLayout;
    } catch {
      return { ...DEFAULT_LETTER_LAYOUT };
    }
  }

  normalizeHeaderStyle(style?: HeaderFooterStyle): HeaderFooterStyle {
    return { ...DEFAULT_HEADER_STYLE, ...(style || {}) };
  }

  normalizeFooterStyle(style?: HeaderFooterStyle): HeaderFooterStyle {
    return { ...DEFAULT_FOOTER_STYLE, ...(style || {}) };
  }

  private buildInfoLines(style: HeaderFooterStyle, color: string): string {
    const base =
      'font-size:12px;line-height:1.45;color:#555;margin:0;padding:0;overflow-wrap:anywhere;word-break:break-word;';
    const lines: string[] = [];
    if (style.showName !== false) {
      lines.push(
        `<p style="${base}font-weight:700;color:${color};">{{COMPANY_NAME}}</p>`
      );
    }
    if (style.showAddress !== false) {
      lines.push(`<p style="${base}">{{COMPANY_ADDRESS}}</p>`);
      lines.push(
        `<p style="${base}">{{COMPANY_CITY}}, {{COMPANY_STATE}} - {{COMPANY_PINCODE}}</p>`
      );
    }
    const contact: string[] = [];
    if (style.showPhone !== false) {
      contact.push('Phone: {{COMPANY_PHONE}}');
    }
    if (style.showEmail !== false) {
      contact.push('{{HR_EMAIL}}');
    }
    if (contact.length) {
      lines.push(`<p style="${base}">${contact.join(' | ')}</p>`);
    }
    if (style.showWebsite) {
      lines.push(`<p style="${base}">{{COMPANY_WEBSITE}}</p>`);
    }
    return lines.join('');
  }

  /**
   * Default letterhead: logo left + info right, bottom underline only (no table).
   */
  buildHeaderHtml(style?: HeaderFooterStyle): string {
    const s = this.normalizeHeaderStyle(style);
    const color = s.accentColor || '#535ab4';
    const info = this.buildInfoLines(s, color);
    const logoHtml =
      s.showLogo !== false
        ? `<div style="flex:0 0 auto;max-width:36%;">{{COMPANY_LOGO}}</div>`
        : '';
    const infoWrap =
      'flex:1 1 auto;min-width:0;font-size:12px;line-height:1.45;color:#555;overflow-wrap:anywhere;word-break:break-word;';

    if (s.pattern === 'centered') {
      return `<div class="letter-hf letter-hf-header" style="text-align:center;border-bottom:2px solid ${color};padding-bottom:10px;box-sizing:border-box;width:100%;overflow:visible;">
  ${s.showLogo !== false ? `<div style="margin-bottom:6px;">{{COMPANY_LOGO}}</div>` : ''}
  <div style="${infoWrap}">${info}</div>
</div>`;
    }

    if (s.pattern === 'minimal') {
      return `<div class="letter-hf letter-hf-header" style="text-align:center;border-bottom:2px solid ${color};padding-bottom:10px;box-sizing:border-box;width:100%;overflow:visible;${infoWrap}">
  ${info}
</div>`;
    }

    if (s.pattern === 'logo-left') {
      return `<div class="letter-hf letter-hf-header" style="display:flex;align-items:flex-start;justify-content:flex-start;gap:12px;border-bottom:2px solid ${color};padding-bottom:10px;box-sizing:border-box;width:100%;overflow:visible;">
  ${logoHtml}
  <div style="${infoWrap}text-align:left;">${info}</div>
</div>`;
    }

    return `<div class="letter-hf letter-hf-header" style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;width:100%;box-sizing:border-box;border-bottom:2px solid ${color};padding-bottom:10px;overflow:visible;">
  ${logoHtml}
  <div style="${infoWrap}text-align:right;">${info}</div>
</div>`;
  }

  /** Default footer: centered text, top line only (no table). */
  buildFooterHtml(style?: HeaderFooterStyle): string {
    const s = this.normalizeFooterStyle(style);
    const color = s.accentColor || '#535ab4';
    const bits: string[] = [];
    if (s.showName !== false) {
      bits.push('<strong>{{COMPANY_NAME}}</strong>');
    }
    if (s.showAddress !== false) {
      bits.push('{{COMPANY_ADDRESS}}, {{COMPANY_CITY}}');
    }
    if (s.showPhone !== false) {
      bits.push('{{COMPANY_PHONE}}');
    }
    if (s.showEmail) {
      bits.push('{{HR_EMAIL}}');
    }
    if (s.showWebsite) {
      bits.push('{{COMPANY_WEBSITE}}');
    }

    if (s.pattern === 'split') {
      return `<div class="letter-hf letter-hf-footer" style="display:flex;align-items:center;justify-content:space-between;gap:12px;border-top:2px solid ${color};padding-top:10px;font-size:12px;line-height:1.5;color:#555;">
  ${s.showLogo ? `<div>{{COMPANY_LOGO}}</div>` : '<div></div>'}
  <div style="text-align:right;">${this.buildInfoLines(s, color)}</div>
</div>`;
    }

    if (s.pattern === 'logo-left') {
      return `<div class="letter-hf letter-hf-footer" style="display:flex;align-items:center;gap:12px;border-top:2px solid ${color};padding-top:10px;font-size:12px;line-height:1.5;color:#555;">
  ${s.showLogo ? `<div>{{COMPANY_LOGO}}</div>` : ''}
  <div style="text-align:left;">${this.buildInfoLines(s, color)}</div>
</div>`;
    }

    if (s.pattern === 'centered') {
      return `<div class="letter-hf letter-hf-footer" style="text-align:center;border-top:2px solid ${color};padding-top:10px;font-size:12px;line-height:1.5;color:#555;">
  ${s.showLogo ? `<div style="margin-bottom:4px;">{{COMPANY_LOGO}}</div>` : ''}
  ${this.buildInfoLines(s, color)}
</div>`;
    }

    return `<div class="letter-hf letter-hf-footer" style="text-align:center;border-top:2px solid ${color};padding-top:10px;font-size:12px;line-height:1.5;color:#555;">
  ${bits.join(' &nbsp;|&nbsp; ')}
</div>`;
  }

  resolveHeaderHtml(layout: LetterLayout | null): string {
    if (!layout?.showHeader) {
      return '';
    }
    // Always use the fixed default letterhead (no custom editing)
    return this.buildHeaderHtml(
      this.normalizeHeaderStyle(layout.headerStyle || DEFAULT_HEADER_STYLE)
    );
  }

  resolveFooterHtml(layout: LetterLayout | null): string {
    if (!layout?.showFooter) {
      return '';
    }
    // Always use the fixed default footer (no custom editing)
    return this.buildFooterHtml(
      this.normalizeFooterStyle(layout.footerStyle || DEFAULT_FOOTER_STYLE)
    );
  }

  applyLayout(bodyHtml: string, layout: LetterLayout | null): string {
    if (!layout) {
      return bodyHtml || '';
    }

    const showHeader = !!layout.showHeader;
    const showFooter = !!layout.showFooter;
    const watermarkEnabled = !!layout.watermarkEnabled;

    if (!showHeader && !showFooter && !watermarkEnabled) {
      return bodyHtml || '';
    }

    const headerHtml = showHeader ? this.resolveHeaderHtml(layout) : '';
    const footerHtml = showFooter ? this.resolveFooterHtml(layout) : '';
    const watermarkText =
      (layout.watermarkText || '{{COMPANY_NAME}}').trim() || '{{COMPANY_NAME}}';
    const watermarkType = layout.watermarkType || 'text';
    const watermarkOrientation = layout.watermarkOrientation || 'diagonal';
    const cssAngle =
      watermarkOrientation === 'horizontal'
        ? 0
        : watermarkOrientation === 'vertical'
          ? -90
          : -32;

    let watermark = '';
    if (watermarkEnabled) {
      const parts: string[] = [];
      if (watermarkType === 'logo' || watermarkType === 'both') {
        parts.push(
          `<div class="letter-watermark-logo">{{WATERMARK_LOGO}}</div>`
        );
      }
      if (watermarkType === 'text' || watermarkType === 'both') {
        parts.push(
          `<div class="letter-watermark-text"><strong class="letter-watermark-name">${watermarkText}</strong></div>`
        );
      }
      watermark = `<div class="letter-watermark letter-watermark--${watermarkType} letter-watermark--${watermarkOrientation}" style="transform:translate(-50%,-50%) rotate(${cssAngle}deg);" aria-hidden="true">${parts.join(
        ''
      )}</div>`;
    }

    return `
<div class="letter-document">
  ${watermark}
  ${
    headerHtml
      ? `<div class="letter-header-block">${headerHtml}</div>`
      : ''
  }
  <div class="letter-body-block">${bodyHtml || ''}</div>
  ${
    footerHtml
      ? `<div class="letter-footer-block">${footerHtml}</div>`
      : ''
  }
</div>`.trim();
  }

  replacePlaceholders(
    html: string,
    replacements: { [key: string]: any }
  ): string {
    let output = html || '';
    Object.keys(replacements || {}).forEach((key) => {
      const value = replacements[key] ?? '';
      output = output.replace(
        new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
        value
      );
    });
    return output;
  }

  buildCompanyReplacements(companySettings: any = {}): {
    [key: string]: string;
  } {
    const logoUrl = this.resolveLogoUrl(companySettings?.companyLogo);
    const logoHtml = logoUrl
      ? `<img src="${logoUrl}" crossorigin="anonymous" style="max-height:60px;max-width:140px;width:auto;height:auto;object-fit:contain;display:block;" />`
      : '';
    const watermarkLogoHtml = logoUrl
      ? `<img src="${logoUrl}" crossorigin="anonymous" alt="" />`
      : '';

    return {
      '{{COMPANY_LOGO}}': logoHtml,
      '{{WATERMARK_LOGO}}': watermarkLogoHtml,
      '{{COMPANY_NAME}}': companySettings?.companyName || 'Company Name',
      '{{HR_EMAIL}}': companySettings?.hrEmail || 'hr@company.com',
      '{{ACCOUNT_EMAIL}}': companySettings?.accountEmail || '',
      '{{COMPANY_PHONE}}': companySettings?.companyPhone || '0000000000',
      '{{COMPANY_ADDRESS}}':
        companySettings?.companyAddress || 'Company Address',
      '{{COMPANY_CITY}}': companySettings?.companyCity || 'City',
      '{{COMPANY_STATE}}': companySettings?.companyState || 'State',
      '{{COMPANY_PINCODE}}': companySettings?.companyPincode || '000000',
      '{{COMPANY_WEBSITE}}': companySettings?.companyWebsite || '',
    };
  }

  resolveLogoUrl(logo: string): string {
    if (!logo) {
      return '';
    }
    if (logo.startsWith('http') || logo.startsWith('data:')) {
      return logo;
    }
    if (logo.startsWith('//')) {
      return 'https:' + logo;
    }
    return 'https://' + logo;
  }

  previewBlockHtml(html: string, companySettings: any = {}): string {
    return this.replacePlaceholders(
      html || '',
      this.buildCompanyReplacements(companySettings)
    );
  }

  /**
   * Load logo as lightened, aspect-correct, optionally rotated PNG for PDF stamp.
   */
  loadWatermarkLogoDataUrl(
    url: string,
    options: { maxSize?: number; opacity?: number; rotateDeg?: number } = {}
  ): Promise<{ dataUrl: string; width: number; height: number }> {
    const maxSize = options.maxSize ?? 160;
    const opacity = options.opacity ?? 0.12;
    const rotateDeg = options.rotateDeg ?? -32;

    return new Promise((resolve) => {
      if (!url) {
        resolve({ dataUrl: '', width: 0, height: 0 });
        return;
      }
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const nw = img.naturalWidth || img.width || 1;
          const nh = img.naturalHeight || img.height || 1;
          const ratio = nw / nh;
          let drawW = maxSize;
          let drawH = maxSize;
          if (ratio > 1) {
            drawH = maxSize / ratio;
          } else {
            drawW = maxSize * ratio;
          }

          const rad = (rotateDeg * Math.PI) / 180;
          const cos = Math.abs(Math.cos(rad));
          const sin = Math.abs(Math.sin(rad));
          const canvasW = Math.ceil(drawW * cos + drawH * sin);
          const canvasH = Math.ceil(drawW * sin + drawH * cos);

          const canvas = document.createElement('canvas');
          canvas.width = canvasW;
          canvas.height = canvasH;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve({ dataUrl: '', width: 0, height: 0 });
            return;
          }
          ctx.clearRect(0, 0, canvasW, canvasH);
          ctx.translate(canvasW / 2, canvasH / 2);
          ctx.rotate(rad);
          ctx.globalAlpha = opacity;
          ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);

          // Keep mm size proportional for A4 (~210mm wide)
          const mmW = (drawW / maxSize) * 55;
          const mmH = (drawH / maxSize) * 55;
          const outW = (canvasW / maxSize) * 55;
          const outH = (canvasH / maxSize) * 55;

          resolve({
            dataUrl: canvas.toDataURL('image/png'),
            width: outW || mmW,
            height: outH || mmH,
          });
        } catch {
          resolve({ dataUrl: '', width: 0, height: 0 });
        }
      };
      img.onerror = () => resolve({ dataUrl: '', width: 0, height: 0 });
      img.src = url;
    });
  }

  async stampPdfWatermark(
    pdf: any,
    layout: LetterLayout | null,
    companySettings: any = {}
  ): Promise<void> {
    if (!pdf || !layout?.watermarkEnabled) {
      return;
    }

    const type = layout.watermarkType || 'text';
    const orientation = layout.watermarkOrientation || 'diagonal';
    const logoAngle =
      orientation === 'horizontal' ? 0 : orientation === 'vertical' ? -90 : -32;
    const textAngle =
      orientation === 'horizontal' ? 0 : orientation === 'vertical' ? 90 : 32;
    const companyName = companySettings?.companyName || 'Company';
    let text = (layout.watermarkText || '{{COMPANY_NAME}}').trim();
    text = this.replacePlaceholders(
      text,
      this.buildCompanyReplacements(companySettings)
    );
    if (!text) {
      text = companyName;
    }

    let logoStamp: { dataUrl: string; width: number; height: number } = {
      dataUrl: '',
      width: 0,
      height: 0,
    };
    if (type === 'logo' || type === 'both') {
      logoStamp = await this.loadWatermarkLogoDataUrl(
        this.resolveLogoUrl(companySettings?.companyLogo),
        {
          // Smaller + lighter when paired with text so they don't blend
          maxSize: type === 'both' ? 100 : 180,
          opacity: type === 'both' ? 0.08 : 0.11,
          rotateDeg: logoAngle,
        }
      );
    }

    // Fall back to the text stamp when the company has no usable logo,
    // so a logo watermark never renders as a blank page.
    const renderType =
      (type === 'logo' || type === 'both') && !logoStamp.dataUrl ? 'text' : type;

    const totalPages = pdf.internal.getNumberOfPages();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const centerX = pageWidth / 2;
    const centerY = pageHeight / 2;

    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);

      if (logoStamp.dataUrl && (renderType === 'logo' || renderType === 'both')) {
        const logoW = logoStamp.width || 50;
        const logoH = logoStamp.height || 50;
        // Keep logo clearly above text when both are enabled
        const logoY =
          renderType === 'both' ? centerY - logoH / 2 - 28 : centerY - logoH / 2;
        try {
          pdf.addImage(
            logoStamp.dataUrl,
            'PNG',
            centerX - logoW / 2,
            logoY,
            logoW,
            logoH,
            undefined,
            'FAST'
          );
        } catch (e) {
          console.warn('Watermark logo stamp failed', e);
        }
      }

      if (renderType === 'text' || renderType === 'both') {
        try {
          if (pdf.GState) {
            pdf.saveGraphicsState();
            pdf.setGState(new pdf.GState({ opacity: 0.14 }));
          }
        } catch {
          // ignore
        }

        pdf.setFont('helvetica', 'bold');
        const fontSize = renderType === 'both' ? 20 : 26;
        pdf.setFontSize(fontSize);
        pdf.setTextColor(170, 174, 200);

        const textY = renderType === 'both' ? centerY + 36 : centerY;
        pdf.text(String(text), centerX, textY, {
          align: 'center',
          angle: textAngle,
          baseline: 'middle',
        });

        try {
          pdf.restoreGraphicsState();
        } catch {
          // ignore
        }
      }
    }
  }

  hideWatermarkInClone(clonedDoc: Document) {
    this.hideLetterChromeInClone(clonedDoc);
  }

  /** Hide in-flow header/footer/watermark so they can be stamped on every page. */
  hideLetterChromeInClone(
    clonedDoc: Document,
    options: { pageWidthMm?: number; sidePadMm?: number } = {}
  ) {
    const pageWidthMm = options.pageWidthMm ?? 210;
    const sidePadMm = options.sidePadMm ?? 10;

    const nodes = clonedDoc.querySelectorAll(
      '.letter-watermark, .letter-header-block, .letter-footer-block'
    );
    nodes.forEach((node: Element) => {
      (node as HTMLElement).style.display = 'none';
    });

    // Full A4 width canvas + internal side padding.
    // Preview min-heights / flex stretch must be cleared or they create
    // blank trailing PDF pages with only header/footer and no body.
    const page = clonedDoc.querySelector('#content') as HTMLElement | null;
    if (page) {
      page.style.width = `${pageWidthMm}mm`;
      page.style.maxWidth = `${pageWidthMm}mm`;
      page.style.minWidth = `${pageWidthMm}mm`;
      page.style.minHeight = '0';
      page.style.height = 'auto';
      page.style.padding = `0 ${sidePadMm}mm`;
      page.style.margin = '0';
      page.style.overflow = 'hidden';
      page.style.boxSizing = 'border-box';
    }
    const documentRoot = clonedDoc.querySelector(
      '.letter-document'
    ) as HTMLElement | null;
    if (documentRoot) {
      documentRoot.style.display = 'block';
      documentRoot.style.minHeight = '0';
      documentRoot.style.height = 'auto';
      documentRoot.style.width = '100%';
      documentRoot.style.maxWidth = '100%';
      documentRoot.style.overflow = 'visible';
      documentRoot.style.boxSizing = 'border-box';
    }
    const body = clonedDoc.querySelector(
      '.letter-body-block'
    ) as HTMLElement | null;
    if (body) {
      body.style.display = 'block';
      body.style.flex = 'none';
      body.style.minHeight = '0';
      body.style.height = 'auto';
      body.style.width = '100%';
      body.style.maxWidth = '100%';
      body.style.overflow = 'visible';
      body.style.boxSizing = 'border-box';
      body.style.breakInside = 'auto';
      (body.style as any).pageBreakInside = 'auto';
      this.trimEmptyTrailingNodes(body);
    }

    clonedDoc.querySelectorAll('.letter-body-block *').forEach((node: Element) => {
      const el = node as HTMLElement;
      el.style.maxWidth = '100%';
      el.style.boxSizing = 'border-box';
    });

    clonedDoc
      .querySelectorAll(
        '.letter-body-block table, .letter-body-block img, .letter-body-block pre, .letter-body-block figure'
      )
      .forEach((node: Element) => {
        const el = node as HTMLElement;
        el.style.width = '100%';
        el.style.maxWidth = '100%';
        el.style.boxSizing = 'border-box';
      });

    clonedDoc
      .querySelectorAll('.letter-body-block table')
      .forEach((node: Element) => {
        (node as HTMLElement).style.tableLayout = 'fixed';
      });

    // Keep readable indent, but stop margin-left from pushing text past the edge.
    clonedDoc
      .querySelectorAll('.letter-body-block p, .letter-body-block li')
      .forEach((node: Element) => {
        const el = node as HTMLElement;
        el.style.breakInside = 'auto';
        (el.style as any).pageBreakInside = 'auto';
        el.style.overflowWrap = 'anywhere';
        el.style.wordBreak = 'break-word';
        el.style.whiteSpace = 'normal';
        el.style.maxWidth = '100%';
        const ml = parseFloat(el.style.marginLeft || '0');
        if (!Number.isNaN(ml) && ml > 16) {
          el.style.marginLeft = '12px';
        }
      });

    clonedDoc
      .querySelectorAll('.letter-body-block span')
      .forEach((node: Element) => {
        const el = node as HTMLElement;
        el.style.whiteSpace = 'normal';
        el.style.overflowWrap = 'anywhere';
        el.style.wordBreak = 'break-word';
      });
  }

  private async waitForImages(element: HTMLElement): Promise<void> {
    const images = Array.from(element.getElementsByTagName('img'));
    await Promise.all(
      images.map(
        (img) =>
          new Promise<void>((resolve) => {
            if (img.complete) {
              resolve();
              return;
            }
            img.onload = () => resolve();
            img.onerror = () => resolve();
            setTimeout(() => resolve(), 5000);
          })
      )
    );
  }

  private async captureBand(
    root: HTMLElement,
    selector: string,
    widthMm: number
  ): Promise<{ dataUrl: string; widthMm: number; heightMm: number } | null> {
    const el = root.querySelector(selector) as HTMLElement | null;
    if (!el) {
      return null;
    }

    const pxPerMm = 96 / 25.4;
    const targetWidthPx = Math.max(Math.round(widthMm * pxPerMm), 320);
    const wrapper = document.createElement('div');
    wrapper.style.cssText = [
      'position:fixed',
      'left:-12000px',
      'top:0',
      `width:${targetWidthPx}px`,
      'background:#ffffff',
      'box-sizing:border-box',
      'overflow:visible',
      'padding:0',
      'margin:0',
      'z-index:-1',
    ].join(';');

    const clone = el.cloneNode(true) as HTMLElement;
    clone.style.width = '100%';
    clone.style.maxWidth = '100%';
    clone.style.boxSizing = 'border-box';
    clone.style.overflow = 'visible';
    clone.style.background = '#ffffff';
    wrapper.appendChild(clone);
    document.body.appendChild(wrapper);

    try {
      await this.waitForImages(clone);
      const canvas = await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        imageTimeout: 15000,
        width: targetWidthPx,
        windowWidth: targetWidthPx,
        scrollX: 0,
        scrollY: 0,
      });
      if (!canvas.width || !canvas.height) {
        return null;
      }
      const heightMm = (canvas.height / canvas.width) * widthMm;
      return {
        dataUrl: canvas.toDataURL('image/png'),
        widthMm,
        // Keep header/footer stamp height reasonable so body area stays large.
        heightMm: Math.min(Math.max(heightMm, 12), 36),
      };
    } catch (e) {
      console.warn('Failed to capture letter band', selector, e);
      return null;
    } finally {
      wrapper.remove();
    }
  }

  /**
   * Stamp captured header/footer images on every PDF page.
   */
  stampPdfHeaderFooter(
    pdf: any,
    header: { dataUrl: string; widthMm: number; heightMm: number } | null,
    footer: { dataUrl: string; widthMm: number; heightMm: number } | null,
    margins: { left: number; right: number; topPad: number; bottomPad: number }
  ) {
    if (!pdf || (!header && !footer)) {
      return;
    }
    const totalPages = pdf.internal.getNumberOfPages();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const left = margins.left;

    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      if (header?.dataUrl) {
        try {
          pdf.addImage(
            header.dataUrl,
            'PNG',
            left,
            margins.topPad,
            header.widthMm,
            header.heightMm,
            undefined,
            'FAST'
          );
        } catch (e) {
          console.warn('Header stamp failed', e);
        }
      }
      if (footer?.dataUrl) {
        try {
          const y =
            pageHeight - margins.bottomPad - footer.heightMm;
          pdf.addImage(
            footer.dataUrl,
            'PNG',
            left,
            Math.max(y, 0),
            footer.widthMm,
            footer.heightMm,
            undefined,
            'FAST'
          );
        } catch (e) {
          console.warn('Footer stamp failed', e);
        }
      }
    }
  }

  /** Drop editor leftovers (empty <p><br></p>, &nbsp;) that inflate page count. */
  private trimEmptyTrailingNodes(root: HTMLElement) {
    const isEmptyNode = (node: ChildNode): boolean => {
      if (node.nodeType === Node.TEXT_NODE) {
        return !((node.textContent || '').replace(/\u00a0/g, ' ').trim());
      }
      if (node.nodeType !== Node.ELEMENT_NODE) {
        return true;
      }
      const el = node as HTMLElement;
      const tag = el.tagName.toLowerCase();
      if (tag === 'br' || tag === 'hr') {
        return true;
      }
      if (['img', 'table', 'figure', 'svg', 'canvas', 'video'].includes(tag)) {
        return false;
      }
      const text = (el.innerText || '').replace(/\u00a0/g, ' ').trim();
      if (text) {
        return false;
      }
      return !el.querySelector('img, table, figure, svg, canvas, video');
    };

    while (root.lastChild && isEmptyNode(root.lastChild)) {
      root.removeChild(root.lastChild);
    }
  }

  /**
   * Find the last canvas row that has real ink so trailing white space
   * does not become an empty PDF page.
   */
  private findContentBottomPx(canvas: HTMLCanvasElement): number {
    const sampleW = 120;
    const scale = sampleW / Math.max(canvas.width, 1);
    const sampleH = Math.max(1, Math.floor(canvas.height * scale));
    const sample = document.createElement('canvas');
    sample.width = sampleW;
    sample.height = sampleH;
    const ctx = sample.getContext('2d', { willReadFrequently: true });
    if (!ctx) {
      return canvas.height;
    }
    ctx.drawImage(canvas, 0, 0, sampleW, sampleH);
    let data: ImageData;
    try {
      data = ctx.getImageData(0, 0, sampleW, sampleH);
    } catch {
      return canvas.height;
    }

    const threshold = 245;
    for (let y = sampleH - 1; y >= 0; y--) {
      const row = y * sampleW * 4;
      for (let x = 0; x < sampleW; x++) {
        const i = row + x * 4;
        const a = data.data[i + 3];
        if (a < 12) {
          continue;
        }
        if (
          data.data[i] < threshold ||
          data.data[i + 1] < threshold ||
          data.data[i + 2] < threshold
        ) {
          return Math.min(
            canvas.height,
            Math.ceil((y + 1) / scale) + 4
          );
        }
      }
    }
    return 0;
  }

  /**
   * Build letter PDF with header + footer on every page, then watermark.
   * Skips trailing blank pages (no body content).
   */
  async generateLetterPdf(
    element: HTMLElement,
    options: {
      filename: string;
      layout: LetterLayout | null;
      companySettings?: any;
    }
  ): Promise<any> {
    await this.waitForImages(element);

    const layout = options.layout;
    const pageWidthMm = 210;
    const pageHeightMm = 297;
    // Side padding is applied INSIDE the page canvas (not as outer margins),
    // so left/right content is never cropped by width mismatch.
    const sidePadMm = 12;
    const contentWidthMm = pageWidthMm - sidePadMm * 2;

    const header = layout?.showHeader
      ? await this.captureBand(element, '.letter-header-block', contentWidthMm)
      : null;
    const footer = layout?.showFooter
      ? await this.captureBand(element, '.letter-footer-block', contentWidthMm)
      : null;

    const topPad = 5;
    const bottomPad = 5;
    const topMargin = Math.max((header?.heightMm || 0) + topPad + 2, 12);
    const bottomMargin = Math.max((footer?.heightMm || 0) + bottomPad + 2, 12);
    const usableHeightMm = Math.max(
      pageHeightMm - topMargin - bottomMargin,
      40
    );

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      imageTimeout: 15000,
      scrollX: 0,
      scrollY: 0,
      onclone: (clonedDoc: Document) => {
        this.hideLetterChromeInClone(clonedDoc, {
          pageWidthMm,
          sidePadMm,
        });
      },
    });

    const pdf = new jsPDF({
      unit: 'mm',
      format: 'a4',
      orientation: 'portrait',
    });

    const pxPerMm = canvas.width / pageWidthMm;
    const pageSlicePx = usableHeightMm * pxPerMm;
    const contentBottomPx = this.findContentBottomPx(canvas);

    // No drawable body — still return a single letterhead page.
    if (contentBottomPx <= 2) {
      await this.stampPdfWatermark(
        pdf,
        layout,
        options.companySettings || {}
      );
      this.stampPdfHeaderFooter(pdf, header, footer, {
        left: sidePadMm,
        right: sidePadMm,
        topPad,
        bottomPad,
      });
      return pdf;
    }

    let y = 0;
    let pageIndex = 0;
    while (y < contentBottomPx - 1) {
      const sliceH = Math.min(pageSlicePx, contentBottomPx - y);
      if (sliceH < 2) {
        break;
      }

      const pageCanvas = document.createElement('canvas');
      pageCanvas.width = canvas.width;
      pageCanvas.height = Math.max(1, Math.ceil(sliceH));
      const ctx = pageCanvas.getContext('2d');
      if (!ctx) {
        break;
      }
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
      ctx.drawImage(
        canvas,
        0,
        y,
        canvas.width,
        sliceH,
        0,
        0,
        canvas.width,
        sliceH
      );

      if (pageIndex > 0) {
        pdf.addPage();
      }

      const sliceHmm = sliceH / pxPerMm;
      pdf.addImage(
        pageCanvas.toDataURL('image/jpeg', 0.98),
        'JPEG',
        0,
        topMargin,
        pageWidthMm,
        sliceHmm,
        undefined,
        'FAST'
      );

      pageIndex++;
      y += sliceH;
    }

    // Safety: never keep a trailing page that was created with no ink.
    // (Should not happen with contentBottomPx clamp, but guards rounding.)
    while (pdf.getNumberOfPages() > Math.max(pageIndex, 1)) {
      pdf.deletePage(pdf.getNumberOfPages());
    }

    await this.stampPdfWatermark(
      pdf,
      layout,
      options.companySettings || {}
    );

    this.stampPdfHeaderFooter(pdf, header, footer, {
      left: sidePadMm,
      right: sidePadMm,
      topPad,
      bottomPad,
    });

    return pdf;
  }
}

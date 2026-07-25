import {
  Component,
  ElementRef,
  ViewChild,
  ChangeDetectorRef,
} from '@angular/core';
import DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';
import { EmployeesService } from '../../admin/employees/employees.service';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ToastService } from 'src/app/services/toast.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CompanySettingsService } from 'src/app/services/company-settings.service';
import {
  ACCENT_COLOR_OPTIONS,
  ALIGN_OPTIONS,
  DEFAULT_FOOTER_STYLE,
  DEFAULT_HEADER_STYLE,
  DEFAULT_LETTER_LAYOUT,
  FOOTER_PATTERN_OPTIONS,
  HEADER_PATTERN_OPTIONS,
  HeaderFooterStyle,
  LetterLayout,
  LetterLayoutService,
  SALARY_TABLE_HTML,
  TEMPLATE_PATTERNS,
} from 'src/app/services/letter-layout.service';

@Component({
  selector: 'app-customtemplate',
  templateUrl: './customtemplate.component.html',
  styleUrls: ['./customtemplate.component.scss'],
})
export class CustomtemplateComponent {
  loading: any;
  @ViewChild('pdfContent', { static: false }) pdfContent!: ElementRef;
  public Editor = DecoupledEditor;
  isSaving = false;
  employeeId: string | null = null;
  templateTypes: any[] = [];
  templateName: string = '';
  selectedTemplateType: string = '';
  offerLetterHtml: string = '';
  selectedPattern: string = '';
  templatePatterns = TEMPLATE_PATTERNS;
  watermarkPlaceholder = 'Company name or {{COMPANY_NAME}}';
  watermarkTypeOptions = [
    { label: 'Text only', value: 'text' },
    { label: 'Company logo only', value: 'logo' },
    { label: 'Logo + Text', value: 'both' },
  ];
  watermarkOrientationOptions = [
    { label: 'Horizontal', value: 'horizontal' },
    { label: 'Vertical', value: 'vertical' },
    { label: 'Diagonal', value: 'diagonal' },
  ];
  headerPatternOptions = HEADER_PATTERN_OPTIONS;
  footerPatternOptions = FOOTER_PATTERN_OPTIONS;
  alignOptions = ALIGN_OPTIONS;
  accentColorOptions = ACCENT_COLOR_OPTIONS;
  companyLayoutVariables = [
    { label: 'Company Logo', value: '{{COMPANY_LOGO}}' },
    { label: 'Company Name', value: '{{COMPANY_NAME}}' },
    { label: 'Company Phone', value: '{{COMPANY_PHONE}}' },
    { label: 'Company Address', value: '{{COMPANY_ADDRESS}}' },
    { label: 'Company City', value: '{{COMPANY_CITY}}' },
    { label: 'Company State', value: '{{COMPANY_STATE}}' },
    { label: 'Company Pincode', value: '{{COMPANY_PINCODE}}' },
    { label: 'Company Website', value: '{{COMPANY_WEBSITE}}' },
    { label: 'HR Email', value: '{{HR_EMAIL}}' },
    { label: 'Account Email', value: '{{ACCOUNT_EMAIL}}' },
  ];

  layout: LetterLayout = {
    ...DEFAULT_LETTER_LAYOUT,
    pattern: '',
  };
  headerHtml = '';
  footerHtml = '';
  headerStyle: HeaderFooterStyle = { ...DEFAULT_HEADER_STYLE };
  footerStyle: HeaderFooterStyle = { ...DEFAULT_FOOTER_STYLE };
  companySettings: any = {};

  editorConfig: any = {
    toolbar: {
      items: [
        'heading',
        '|',
        'fontfamily',
        'fontsize',
        '|',
        'fontColor',
        'fontBackgroundColor',
        'bold',
        'italic',
        'underline',
        'strikethrough',
        '|',
        'alignment',
        'bulletedList',
        'numberedList',
        '|',
        'insertTable',
        'link',
        '|',
        'undo',
        'redo',
      ],
    },
    fontSize: {
      options: [10, 11, 12, 13, 'default', 14, 16, 18, 20, 22, 24, 28, 32, 36],
      supportAllValues: false,
    },
    fontFamily: {
      options: [
        'default',
        'Arial, Helvetica, sans-serif',
        'Times New Roman, Times, serif',
        'Calibri, sans-serif',
        'Georgia, serif',
        'Courier New, Courier, monospace',
      ],
    },
    image: {
      toolbar: [
        'imageStyle:alignLeft',
        'imageStyle:full',
        'imageStyle:alignRight',
        '|',
        'imageTextAlternative',
      ],
    },
    table: {
      contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells'],
    },
  };

  /** Same rich-text tools for header/footer (slightly lighter toolbar). */
  layoutEditorConfig: any = {
    toolbar: {
      items: [
        'heading',
        '|',
        'fontfamily',
        'fontsize',
        '|',
        'fontColor',
        'fontBackgroundColor',
        'bold',
        'italic',
        'underline',
        '|',
        'alignment',
        'bulletedList',
        'numberedList',
        '|',
        'insertTable',
        'link',
        '|',
        'undo',
        'redo',
      ],
    },
    fontSize: {
      options: [10, 11, 12, 13, 'default', 14, 16, 18, 20, 22, 24],
      supportAllValues: false,
    },
    fontFamily: {
      options: [
        'default',
        'Arial, Helvetica, sans-serif',
        'Times New Roman, Times, serif',
        'Calibri, sans-serif',
      ],
    },
    table: {
      contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells'],
    },
  };

  templateId: number | null = null;

  templateVariables = [
    { label: 'Account Email: {{ACCOUNT_EMAIL}}', value: '{{ACCOUNT_EMAIL}}' },
    { label: 'Company Logo: {{COMPANY_LOGO}}', value: '{{COMPANY_LOGO}}' },
    { label: 'Company Name: {{COMPANY_NAME}}', value: '{{COMPANY_NAME}}' },
    { label: 'Company Phone: {{COMPANY_PHONE}}', value: '{{COMPANY_PHONE}}' },
    {
      label: 'Company Address: {{COMPANY_ADDRESS}}',
      value: '{{COMPANY_ADDRESS}}',
    },
    { label: 'Company City: {{COMPANY_CITY}}', value: '{{COMPANY_CITY}}' },
    { label: 'Company State: {{COMPANY_STATE}}', value: '{{COMPANY_STATE}}' },
    {
      label: 'Company Pincode: {{COMPANY_PINCODE}}',
      value: '{{COMPANY_PINCODE}}',
    },
    {
      label: 'Company Website: {{COMPANY_WEBSITE}}',
      value: '{{COMPANY_WEBSITE}}',
    },
    { label: 'Created By: {{CREATED_BY}}', value: '{{CREATED_BY}}' },
    { label: 'Created Date {{CREATED_DATE}}', value: '{{CREATED_DATE}}' },
    { label: 'Designation: {{DESIGNATION}}', value: '{{DESIGNATION}}' },
    { label: 'Employee Name: {{EMPLOYEE_NAME}}', value: '{{EMPLOYEE_NAME}}' },
    { label: 'Employee City: {{EMPLOYEE_CITY}}', value: '{{EMPLOYEE_CITY}}' },
    {
      label: 'Employee District: {{EMPLOYEE_DISTRICT}}',
      value: '{{EMPLOYEE_DISTRICT}}',
    },
    {
      label: 'Employee State: {{EMPLOYEE_STATE}}',
      value: '{{EMPLOYEE_STATE}}',
    },
    {
      label: 'Effective Date: {{EFFECTIVE_DATE}}',
      value: '{{EFFECTIVE_DATE}}',
    },
    { label: 'HR Email: {{HR_EMAIL}}', value: '{{HR_EMAIL}}' },
    { label: 'Hike Date: {{HIKE_DATE}}', value: '{{HIKE_DATE}}' },
    { label: 'Joining Date: {{JOINING_DATE}}', value: '{{JOINING_DATE}}' },
    {
      label: 'Relieving Date: {{RELIEVING_DATE}}',
      value: '{{RELIEVING_DATE}}',
    },
    { label: 'Salary: {{SALARY}}', value: '{{SALARY}}' },
    { label: 'Total Salary: {{TOTAL_SALARY}}', value: '{{TOTAL_SALARY}}' },
    {
      label: 'Total Hike Percentage: {{TOTAL_HIKEPERCENTAGE}}',
      value: '{{TOTAL_HIKEPERCENTAGE}}',
    },
  ];

  editorInstance: any;
  headerEditorInstance: any;
  footerEditorInstance: any;

  @ViewChild('toolbar', { static: true }) toolbarContainer: ElementRef;
  @ViewChild('headerToolbar', { static: false })
  headerToolbarContainer: ElementRef;
  @ViewChild('footerToolbar', { static: false })
  footerToolbarContainer: ElementRef;

  constructor(
    private location: Location,
    private employeesService: EmployeesService,
    private route: ActivatedRoute,
    private toastService: ToastService,
    private letterLayoutService: LetterLayoutService,
    private companySettingsService: CompanySettingsService,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.headerHtml = this.letterLayoutService.buildHeaderHtml(
      this.headerStyle,
    );
    this.footerHtml = this.letterLayoutService.buildFooterHtml(
      this.footerStyle,
    );

    this.companySettingsService.getCompanySettings().subscribe({
      next: (res: any) => {
        this.companySettings = res || {};
      },
      error: () => {
        this.companySettings = {};
      },
    });

    this.employeesService.getTemplateTypes().subscribe({
      next: (res: any) => {
        this.templateTypes = res;
      },
      error: (err) => {
        console.error('API ERROR:', err);
      },
    });

    this.route.paramMap.subscribe((params) => {
      this.templateId = Number(params.get('id'));
      if (this.templateId) {
        this.employeesService
          .getTemplateById(this.templateId)
          .subscribe((res: any) => {
            this.templateName = res.templateName;
            this.selectedTemplateType = res.templateType;
            this.offerLetterHtml = res.html;
            const parsed = this.letterLayoutService.parseLayout(res.layoutJson);
            if (parsed) {
              this.layout = {
                ...this.layout,
                ...parsed,
                showHeader:
                  parsed.showHeader !== undefined ? !!parsed.showHeader : true,
                showFooter:
                  parsed.showFooter !== undefined ? !!parsed.showFooter : true,
                watermarkText:
                  parsed.watermarkText || DEFAULT_LETTER_LAYOUT.watermarkText,
                watermarkType:
                  parsed.watermarkType || DEFAULT_LETTER_LAYOUT.watermarkType,
                watermarkOrientation:
                  parsed.watermarkOrientation ||
                  DEFAULT_LETTER_LAYOUT.watermarkOrientation,
              };
              this.headerStyle = { ...DEFAULT_HEADER_STYLE };
              this.footerStyle = { ...DEFAULT_FOOTER_STYLE };
              this.headerHtml = this.letterLayoutService.buildHeaderHtml(
                this.headerStyle,
              );
              this.footerHtml = this.letterLayoutService.buildFooterHtml(
                this.footerStyle,
              );
              this.selectedPattern = parsed.pattern || '';
            }
          });
      }
    });
  }

  get headerPreviewHtml(): SafeHtml {
    const html = this.letterLayoutService.buildHeaderHtml(DEFAULT_HEADER_STYLE);
    return this.sanitizer.bypassSecurityTrustHtml(
      this.letterLayoutService.previewBlockHtml(html, this.companySettings),
    );
  }

  get footerPreviewHtml(): SafeHtml {
    const html = this.letterLayoutService.buildFooterHtml(DEFAULT_FOOTER_STYLE);
    return this.sanitizer.bypassSecurityTrustHtml(
      this.letterLayoutService.previewBlockHtml(html, this.companySettings),
    );
  }

  get watermarkPreviewHtml(): SafeHtml {
    if (!this.layout.watermarkEnabled) {
      return this.sanitizer.bypassSecurityTrustHtml(
        '<em class="text-muted">Watermark disabled</em>',
      );
    }
    const type = this.layout.watermarkType || 'text';
    const orientation = this.layout.watermarkOrientation || 'horizontal';
    const angle =
      orientation === 'vertical' ? -90 : orientation === 'diagonal' ? -28 : 0;
    const parts: string[] = [];
    if (type === 'logo' || type === 'both') {
      parts.push('<div class="letter-watermark-logo">{{WATERMARK_LOGO}}</div>');
    }
    if (type === 'text' || type === 'both') {
      const text = this.layout.watermarkText || '{{COMPANY_NAME}}';
      parts.push(
        `<div class="letter-watermark-text"><strong class="letter-watermark-name">${text}</strong></div>`,
      );
    }
    const wrapped = `<div class="letter-watermark-preview letter-watermark--${type} letter-watermark--${orientation}" style="transform:rotate(${angle}deg);">${parts.join(
      '',
    )}</div>`;
    return this.sanitizer.bypassSecurityTrustHtml(
      this.letterLayoutService.previewBlockHtml(wrapped, this.companySettings),
    );
  }

  applyPattern(patternValue: string) {
    const pattern = this.templatePatterns.find((p) => p.value === patternValue);
    if (!pattern) {
      return;
    }
    this.selectedPattern = pattern.value;
    this.offerLetterHtml = pattern.html;
    this.layout = {
      ...this.layout,
      pattern: pattern.value,
      ...(pattern.layout || {}),
      watermarkText:
        pattern.layout?.watermarkText ||
        this.layout.watermarkText ||
        '{{COMPANY_NAME}}',
    };
    this.headerStyle = this.letterLayoutService.normalizeHeaderStyle(
      pattern.layout?.headerStyle || this.headerStyle,
    );
    this.footerStyle = this.letterLayoutService.normalizeFooterStyle(
      pattern.layout?.footerStyle || this.footerStyle,
    );
    this.headerHtml = this.letterLayoutService.buildHeaderHtml(
      this.headerStyle,
    );
    this.footerHtml = this.letterLayoutService.buildFooterHtml(
      this.footerStyle,
    );
    if (this.editorInstance) {
      this.editorInstance.setData(this.offerLetterHtml);
    }
    this.headerEditorInstance?.setData(this.headerHtml);
    this.footerEditorInstance?.setData(this.footerHtml);
    this.toastService.showSuccess('Pattern applied. You can edit it further.');
  }

  applyHeaderStarter() {
    this.headerStyle = {
      ...this.letterLayoutService.normalizeHeaderStyle(this.headerStyle),
      pattern: this.headerStyle.pattern || 'split',
      showBorder: true,
    };
    const built = this.letterLayoutService.buildHeaderHtml(this.headerStyle);
    this.headerHtml = built;
    if (this.headerEditorInstance) {
      this.headerEditorInstance.setData(built);
      // Sync back normalized HTML from editor so preview matches editor
      setTimeout(() => {
        this.headerHtml = this.headerEditorInstance.getData();
        this.cdr.detectChanges();
      }, 0);
    } else {
      this.cdr.detectChanges();
    }
  }

  applyFooterStarter() {
    this.footerStyle = {
      ...this.letterLayoutService.normalizeFooterStyle(this.footerStyle),
      pattern: this.footerStyle.pattern || 'minimal',
      showBorder: true,
    };
    const built = this.letterLayoutService.buildFooterHtml(this.footerStyle);
    this.footerHtml = built;
    if (this.footerEditorInstance) {
      this.footerEditorInstance.setData(built);
      setTimeout(() => {
        this.footerHtml = this.footerEditorInstance.getData();
        this.cdr.detectChanges();
      }, 0);
    } else {
      this.cdr.detectChanges();
    }
  }

  onHeaderDefaultChange() {
    this.applyHeaderStarter();
  }

  onFooterDefaultChange() {
    this.applyFooterStarter();
  }

  refreshLayoutPreview() {
    this.cdr.detectChanges();
  }

  insertVariableInto(target: 'body' | 'header' | 'footer', variable: string) {
    const editor =
      target === 'header'
        ? this.headerEditorInstance
        : target === 'footer'
          ? this.footerEditorInstance
          : this.editorInstance;
    if (!editor || !variable) {
      return;
    }
    editor.model.change((writer: any) => {
      const insertPosition = editor.model.document.selection.getFirstPosition();
      writer.insertText(variable, insertPosition);
    });
  }

  insertSalaryTable() {
    if (!this.editorInstance) {
      this.offerLetterHtml = (this.offerLetterHtml || '') + SALARY_TABLE_HTML;
      return;
    }
    this.editorInstance.model.change(() => {
      const viewFragment =
        this.editorInstance.data.processor.toView(SALARY_TABLE_HTML);
      const modelFragment = this.editorInstance.data.toModel(viewFragment);
      this.editorInstance.model.insertContent(modelFragment);
    });
  }

  resetHeaderFooterDefaults() {
    this.headerStyle = { ...DEFAULT_HEADER_STYLE };
    this.footerStyle = { ...DEFAULT_FOOTER_STYLE };
    this.headerHtml = this.letterLayoutService.buildHeaderHtml(
      this.headerStyle,
    );
    this.footerHtml = this.letterLayoutService.buildFooterHtml(
      this.footerStyle,
    );
    this.layout.showHeader = true;
    this.layout.showFooter = true;
    this.layout.watermarkEnabled = true;
    this.layout.watermarkText = DEFAULT_LETTER_LAYOUT.watermarkText;
    this.layout.watermarkType = DEFAULT_LETTER_LAYOUT.watermarkType;
    this.layout.watermarkOrientation =
      DEFAULT_LETTER_LAYOUT.watermarkOrientation;
    this.headerEditorInstance?.setData(this.headerHtml);
    this.footerEditorInstance?.setData(this.footerHtml);
  }

  saveTemplate() {
    if (!this.templateName || !this.selectedTemplateType) {
      this.toastService.showError({
        error: 'Template Name and Type are required',
      });
      return;
    }

    this.isSaving = true;
    const headerStyle = { ...DEFAULT_HEADER_STYLE };
    const footerStyle = { ...DEFAULT_FOOTER_STYLE };
    const layoutJson: LetterLayout = {
      pattern: this.selectedPattern || this.layout.pattern || '',
      showHeader: !!this.layout.showHeader,
      showFooter: !!this.layout.showFooter,
      watermarkEnabled: !!this.layout.watermarkEnabled,
      watermarkType:
        this.layout.watermarkType || DEFAULT_LETTER_LAYOUT.watermarkType,
      watermarkText:
        this.layout.watermarkText || DEFAULT_LETTER_LAYOUT.watermarkText,
      watermarkOrientation:
        this.layout.watermarkOrientation ||
        DEFAULT_LETTER_LAYOUT.watermarkOrientation,
      headerStyle,
      footerStyle,
      headerHtml: this.letterLayoutService.buildHeaderHtml(headerStyle),
      footerHtml: this.letterLayoutService.buildFooterHtml(footerStyle),
    };

    const payload = {
      templateName: this.templateName,
      templateType: this.selectedTemplateType,
      html: this.offerLetterHtml,
      layoutJson,
    };

    if (this.templateId) {
      this.employeesService.updateTemplate(this.templateId, payload).subscribe({
        next: () => {
          this.isSaving = false;
          this.toastService.showSuccess('Template updated successfully');
          this.goBack();
        },
        error: () => {
          this.isSaving = false;
          this.toastService.showError({
            error: 'Failed to update template',
          });
        },
      });
    } else {
      this.employeesService.saveOfferTemplate(payload).subscribe({
        next: () => {
          this.isSaving = false;
          this.toastService.showSuccess('Template created successfully');
          this.goBack();
        },
        error: () => {
          this.isSaving = false;
          this.toastService.showError({
            error: 'Failed to create template',
          });
        },
      });
    }
  }

  goBack() {
    this.location.back();
  }

  onEditorReady(editor: any) {
    this.editorInstance = editor;
    this.toolbarContainer.nativeElement.appendChild(
      editor.ui.view.toolbar.element,
    );
  }

  onHeaderEditorReady(editor: any) {
    this.headerEditorInstance = editor;
    if (this.headerToolbarContainer?.nativeElement) {
      this.headerToolbarContainer.nativeElement.innerHTML = '';
      this.headerToolbarContainer.nativeElement.appendChild(
        editor.ui.view.toolbar.element,
      );
    }
    if (this.headerHtml) {
      editor.setData(this.headerHtml);
    }
  }

  onFooterEditorReady(editor: any) {
    this.footerEditorInstance = editor;
    if (this.footerToolbarContainer?.nativeElement) {
      this.footerToolbarContainer.nativeElement.innerHTML = '';
      this.footerToolbarContainer.nativeElement.appendChild(
        editor.ui.view.toolbar.element,
      );
    }
    if (this.footerHtml) {
      editor.setData(this.footerHtml);
    }
  }

  insertVariable(variable: string) {
    this.insertVariableInto('body', variable);
  }
}

import { Component, ElementRef, ViewChild } from '@angular/core';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';
import { EmployeesService } from '../../admin/employees/employees.service';
import { Location } from '@angular/common';
import { CommonModule } from '@angular/common';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { ActivatedRoute } from '@angular/router';
import Base64UploadAdapter from '@ckeditor/ckeditor5-upload/src/adapters/base64uploadadapter';
import { ToastService } from 'src/app/services/toast.service';
import Style from '@ckeditor/ckeditor5-style/src/style';
import { last } from 'rxjs';
@Component({
  selector: 'app-customtemplate',
  templateUrl: './customtemplate.component.html',
  styleUrls: ['./customtemplate.component.scss'],
 
})
export class CustomtemplateComponent {
  loading: any;
  @ViewChild('pdfContent', { static: false }) pdfContent!: ElementRef;
public Editor = DecoupledEditor;
  // public Editor = ClassicEditor;
  // Editor = ClassicEditor;
  isSaving = false;
  employeeId: string | null = null;
  templateTypes: any[] = [];
  templateName: string = '';
  selectedTemplateType: string = '';
  offerLetterHtml: string = '';

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
      'redo'
    ]
  },

  lineHeight: {
    options: [
      'default',
      1,
      1.15,
      1.5,
      2,
      2.5,
      3
    ]
  },

  fontSize: {
    options: [
      10, 11, 12, 13, 'default',
      14, 16, 18, 20, 22, 24, 28, 32, 36
    ],
    supportAllValues: false
  },

  fontFamily: {
    options: [
      'default',
      'Arial, Helvetica, sans-serif',
      'Times New Roman, Times, serif',
      'Calibri, sans-serif',
      'Georgia, serif',
      'Courier New, Courier, monospace'
    ]
  },

  // 🔥 LINE HEIGHT (LINE SPACING)
  style: {
    definitions: [
      {
        name: 'Line height 1',
        element: 'p',
        // styles: { 'line-height': '1' }
      },
      {
        name: 'Line height 1.1',
        element: 'p',
        // styles: { 'line-height': '1.1' }
      },
      {
        name: 'Line height 1.1',
        element: 'p',
        // styles: { 'line-height': '1.1' }
      },
      {
        name: 'Line height 1.1',
        element: 'p',
        styles: { 'line-height': '1.1' }
      },
      {
        name: 'Line height 1.2',
        element: 'p',
        styles: { 'line-height': '1.1' }
      }
    ]
  },

  image: {
    toolbar: [
      'imageStyle:alignLeft',
      'imageStyle:full',
      'imageStyle:alignRight',
      '|',
      'imageTextAlternative'
    ]
  },

  table: {
    contentToolbar: [
      'tableColumn',
      'tableRow',
      'mergeTableCells'
    ]
  }
};

templateId: number | null = null;

templateVariables = [
  { label: 'Account Email: {{ACCOUNT_EMAIL}}', value: '{{ACCOUNT_EMAIL}}' },
  { label: 'Company Logo: {{COMPANY_LOGO}}', value: '{{COMPANY_LOGO}}' },
  { label: 'Company Name: {{COMPANY_NAME}}', value: '{{COMPANY_NAME}}' },
  { label: 'Company Phone: {{COMPANY_PHONE}}', value: '{{COMPANY_PHONE}}' },
  { label: 'Company Address: {{COMPANY_ADDRESS}}', value: '{{COMPANY_ADDRESS}}' },
  { label: 'Company City: {{COMPANY_CITY}}', value: '{{COMPANY_CITY}}' },
  { label: 'Company State: {{COMPANY_STATE}}', value: '{{COMPANY_STATE}}' },
  { label: 'Company Pincode: {{COMPANY_PINCODE}}', value: '{{COMPANY_PINCODE}}' },
  { label: 'Company Website: {{COMPANY_WEBSITE}}', value: '{{COMPANY_WEBSITE}}' },
  { label: 'Created By: {{CREATED_BY}}', value: '{{CREATED_BY}}' },
  { label: 'Created Date {{CREATED_DATE}}', value: '{{CREATED_DATE}}'},
  { label: 'Designation: {{DESIGNATION}}', value: '{{DESIGNATION}}' },
  { label: 'Employee Name: {{EMPLOYEE_NAME}}', value: '{{EMPLOYEE_NAME}}' },
  { label: 'Employee City: {{EMPLOYEE_CITY}}', value: '{{EMPLOYEE_CITY}}' },
  { label: 'Employee District: {{EMPLOYEE_DISTRICT}}', value: '{{EMPLOYEE_DISTRICT}}' },
  { label: 'Employee State: {{EMPLOYEE_STATE}}', value: '{{EMPLOYEE_STATE}}' },
  { label: 'Effective Date: {{EFFECTIVE_DATE}}', value: '{{EFFECTIVE_DATE}}' },
  { label: 'HR Email: {{HR_EMAIL}}', value: '{{HR_EMAIL}}' },
  { label: 'Hike Date: {{HIKE_DATE}}', value: '{{HIKE_DATE}}' },
  { label: 'Joining Date: {{JOINING_DATE}}', value: '{{JOINING_DATE}}' },
  { label: 'Relieving Date: {{RELIEVING_DATE}}', value: '{{RELIEVING_DATE}}' },
  { label: 'Salary: {{SALARY}}', value: '{{SALARY}}' }, 
  { label: 'Total Salary: {{TOTAL_SALARY}}', value: '{{TOTAL_SALARY}}' },
  { label: 'Total Hike Percentage: {{TOTAL_HIKEPERCENTAGE}}', value: '{{TOTAL_HIKEPERCENTAGE}}' }
];

editorInstance: any;


 constructor(
    private location: Location,
    private employeesService: EmployeesService,
    private route: ActivatedRoute,
    private toastService: ToastService,

  ){}

ngOnInit() {
  this.employeesService.getTemplateTypes().subscribe({
    next: (res: any) => {
      console.log('API RESPONSE:', res);
      this.templateTypes = res;
      console.log('DROPDOWN DATA:', this.templateTypes);
    },
    error: (err) => {
      console.error('API ERROR:', err);
    }
  });

  this.route.paramMap.subscribe(params => {
    this.templateId = Number(params.get('id'));
    if (this.templateId) {
      this.employeesService.getTemplateById(this.templateId).subscribe((res: any) => {
        this.templateName = res.templateName;
        this.selectedTemplateType = res.templateType;
        this.offerLetterHtml = res.html;
      });
    }
  });
}


saveTemplate() {
  if (!this.templateName || !this.selectedTemplateType) {
    this.toastService.showError({
      error: 'Template Name and Type are required'
    });
    return;
  }

  this.isSaving = true;

  if (this.templateId) {
    // UPDATE
    this.employeesService.updateTemplate(this.templateId, {
      templateName: this.templateName,
      templateType: this.selectedTemplateType,
      html: this.offerLetterHtml
    }).subscribe({
      next: () => {
        this.isSaving = false;
        this.toastService.showSuccess('Template updated successfully');
        this.goBack();
      },
      error: () => {
        this.isSaving = false;
        this.toastService.showError({
          error: 'Failed to update template'
        });
      }
    });

  } else {
    // SAVE
    this.employeesService.saveOfferTemplate({
      templateName: this.templateName,
      templateType: this.selectedTemplateType,
      html: this.offerLetterHtml
    }).subscribe({
      next: () => {
        this.isSaving = false;
        this.toastService.showSuccess('Template created successfully');
        this.goBack();
      },
      error: () => {
        this.isSaving = false;
        this.toastService.showError({
          error: 'Failed to create template'
        });
      }
    });
  }
}

@ViewChild('toolbar', { static: true }) toolbarContainer: ElementRef;
// onEditorReady(editor: any) {
//   this.toolbarContainer.nativeElement.appendChild(
//     editor.ui.view.toolbar.element
//   );
// }
goBack() {
    this.location.back();
  }

  onEditorReady(editor: any) {
  this.editorInstance = editor;

  this.toolbarContainer.nativeElement.appendChild(
    editor.ui.view.toolbar.element
  );
}
insertVariable(variable: string) {
  if (!this.editorInstance) return;

  this.editorInstance.model.change((writer: any) => {
    const insertPosition =
      this.editorInstance.model.document.selection.getFirstPosition();

    writer.insertText(variable, insertPosition);
  });
}
}

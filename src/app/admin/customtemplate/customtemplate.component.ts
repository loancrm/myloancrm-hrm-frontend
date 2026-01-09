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
// import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import Style from '@ckeditor/ckeditor5-style/src/style';
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
//   editorConfig = {
//   // extraPlugins: [ Base64UploadAdapter ],
  
//   toolbar: {
    
//     items: [
//       'heading',
//       '|',
//       'fontfamily',
//       'fontsize',
//       'fontColor',
//       'fontBackgroundColor',
//       'bold',
//       'italic',
//       'underline',
//       'strikethrough',
//       '|',
//       'alignment',
//       'bulletedList',
//       'numberedList',
//       '|',
//       'insertTable',
//       // 'imageUpload',
//       'link',
//       '|',
//       'undo',
//       'redo'
//     ]
//   },
//   image: {
//     toolbar: [
//       'imageStyle:alignLeft',
//       'imageStyle:full',
//       'imageStyle:alignRight',
//       '|',
//       'imageTextAlternative'
//     ]
//   },
//   table: {
//     contentToolbar: [
//       'tableColumn',
//       'tableRow',
//       'mergeTableCells'
//     ]
//   }
// };

// editorConfig: any = {
//   toolbar: {
//     items: [
//       'heading',
//       '|',
//       'fontfamily',
//       'fontsize',
//       '|',
//       'fontColor',
//       'fontBackgroundColor',
//       'bold',
//       'italic',
//       'underline',
//       'strikethrough',
//       '|',
//       'alignment',
//       'bulletedList',
//       'numberedList',
//       '|',
//       'insertTable',
//       'link',
//       '|',
//       'undo',
//       'redo'
//     ]
//   },

//   fontSize: {
//     options: [
//       10,
//       11,
//       12,
//       13,
//       'default',
//       14,
//       16,
//       18,
//       20,
//       22,
//       24,
//       28,
//       32,
//       36
//     ],
//     supportAllValues: false
//   },

//   fontFamily: {
//     options: [
//       'default',
//       'Arial, Helvetica, sans-serif',
//       'Times New Roman, Times, serif',
//       'Calibri, sans-serif',
//       'Georgia, serif',
//       'Courier New, Courier, monospace'
//     ]
//   },

//   image: {
//     toolbar: [
//       'imageStyle:alignLeft',
//       'imageStyle:full',
//       'imageStyle:alignRight',
//       '|',
//       'imageTextAlternative'
//     ]
//   },

//   table: {
//     contentToolbar: [
//       'tableColumn',
//       'tableRow',
//       'mergeTableCells'
//     ]
//   }
// };

editorConfig: any = {
  toolbar: {
    items: [
      'heading',
      '|',
      'fontfamily',
      'fontsize',
      '|',
      'style',
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
        styles: { 'line-height': '1' }
      },
      {
        name: 'Line height 1.2',
        element: 'p',
        styles: { 'line-height': '1.2' }
      },
      {
        name: 'Line height 1.5',
        element: 'p',
        styles: { 'line-height': '1.5' }
      },
      {
        name: 'Line height 1.8',
        element: 'p',
        styles: { 'line-height': '1.8' }
      },
      {
        name: 'Line height 2',
        element: 'p',
        styles: { 'line-height': '2' }
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

//   editorConfig: any = {
//   toolbar: {
//     items: [
//       'heading',
//       '|',
//       'fontfamily',
//       'fontsize',
//       'fontColor',
//       'fontBackgroundColor',
//       'bold',
//       'italic',
//       'underline',
//       'strikethrough',
//       '|',
//       'alignment',
//       'bulletedList',
//       'numberedList',
//       '|',
//       'insertTable',
//       'link',
//       '|',
//       'undo',
//       'redo'
//     ]
//   },
//   image: {
//     toolbar: [
//       'imageStyle:alignLeft',
//       'imageStyle:full',
//       'imageStyle:alignRight',
//       '|',
//       'imageTextAlternative'
//     ]
//   },
//   table: {
//     contentToolbar: [
//       'tableColumn',
//       'tableRow',
//       'mergeTableCells'
//     ]
//   }
// };


templateId: number | null = null;

 constructor(
    private location: Location,
    private employeesService: EmployeesService,
    private route: ActivatedRoute,
    private toastService: ToastService,

  ){}

//   ngOnInit() {
//   this.employeesService.getTemplateTypes().subscribe((res: any[]) => {
//       this.templateTypes = res;
//     });
// }
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

//   saveTemplate() {
//   this.employeesService.saveOfferTemplate({
//     employeeId: this.employeeId,
//     html: this.offerLetterHtml,
//     templateType: this.selectedTemplateType,
//     templateName: this.templateName,
//   }).subscribe();
// }

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

// saveTemplate() {
//   if (this.templateId) {
//     this.employeesService.updateTemplate(this.templateId, {
//       templateName: this.templateName,
//       templateType: this.selectedTemplateType,
//       html: this.offerLetterHtml
//     }).subscribe();
//   } else {
//     this.employeesService.saveOfferTemplate({
//       templateName: this.templateName,
//       templateType: this.selectedTemplateType,
//       html: this.offerLetterHtml
//     }).subscribe();
//   }
// }

// onEditorChange(event: any) {
//   this.offerLetterHtml = event.editor.getData();
// }
@ViewChild('toolbar', { static: true }) toolbarContainer: ElementRef;
onEditorReady(editor: any) {
  this.toolbarContainer.nativeElement.appendChild(
    editor.ui.view.toolbar.element
  );
}
goBack() {
    this.location.back();
  }
}

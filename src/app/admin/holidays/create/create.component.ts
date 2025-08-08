import { Component, OnInit } from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { Location } from '@angular/common';
import { ToastService } from 'src/app/services/toast.service';
import { EmployeesService } from '../../employees/employees.service';
import { RoutingService } from 'src/app/services/routing-service';
import { ActivatedRoute } from '@angular/router';
import { DateTimeProcessorService } from 'src/app/services/date-time-processor.service';
import { projectConstantsLocal } from 'src/app/constants/project-constants';
@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss'],
})
export class CreateComponent implements OnInit {
  formFields: any = [];
  breadCrumbItems: any = [];
  holidayData: any;
  moment: any;
  version = projectConstantsLocal.VERSION_DESKTOP;
  holidayId: any;
  holidayForm: UntypedFormGroup;
  activeIndex: number = 0;
  heading: any = 'Create Holiday';
  actionType: any = 'create';
  loading: any;
  currentYear: number;
  constructor(
    private location: Location,
    private formBuilder: UntypedFormBuilder,
    private toastService: ToastService,
    private employeesService: EmployeesService,
    private routingService: RoutingService,
    private activatedRoute: ActivatedRoute,
    private dateTimeProcessor: DateTimeProcessorService
  ) {
    this.moment = this.dateTimeProcessor.getMoment();
    this.activatedRoute.params.subscribe((params) => {
      if (params && params['id']) {
        this.holidayId = params['id'];
        this.actionType = 'update';
        this.heading = 'Update Holiday';
        this.getHolidayById().then((data) => {
          if (data) {
            console.log('Holiday Data', this.holidayData);
            this.holidayForm.patchValue({
              holidayName: this.holidayData?.holidayName,
              day: this.holidayData?.day,
              description: this.holidayData?.description,
              date: this.holidayData?.date,
            });
          }
        });
      }
    });
    this.breadCrumbItems = [
      {
        icon: 'fa fa-house',
        label: ' Dashboard',
        routerLink: '/user/dashboard',
        queryParams: { v: this.version },
      },
      {
        label: 'Holidays',
        routerLink: '/user/holidays',
        queryParams: { v: this.version },
      },
      { label: this.actionType == 'create' ? 'Create' : 'Update' },
    ];
  }
  ngOnInit() {
    this.currentYear = this.employeesService.getCurrentYear();
    this.createForm();
    this.setHolidaysList();
  }
  setHolidaysList() {
    this.formFields = [
      {
        label: 'Holiday Name',
        controlName: 'holidayName',
        type: 'text',
        required: true,
      },
      {
        label: 'Date',
        controlName: 'date',
        type: 'calendar',
        required: true,
      },
      {
        label: 'Day',
        controlName: 'day',
        type: 'text',
        required: true,
      },
      {
        label: 'Description',
        controlName: 'description',
        type: 'text',
        required: true,
      },
    ];
  }
  createForm() {
    this.holidayForm = this.formBuilder.group({
      holidayName: ['', Validators.required],
      date: ['', Validators.required],
      day: [{ value: '', disabled: true }, Validators.required],
      description: ['', Validators.required],
    });
  }
  onDateSelect(selectedDate: Date) {
    const dayOfWeek = this.getDayOfWeek(selectedDate);
    console.log(dayOfWeek);
    this.holidayForm.controls['day'].enable();
    this.holidayForm.patchValue({ day: dayOfWeek });
  }
  getDayOfWeek(date: Date): string {
    const days = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];
    return days[date.getDay()];
  }
  onSubmit(formValues) {
    let formData: any = {
      holidayName: formValues.holidayName,
      date: formValues.date
        ? this.moment(formValues.date).format('YYYY-MM-DD')
        : null,
      day: formValues.day,
      description: formValues.description,
    };
    console.log('formData', formData);
    if (this.actionType == 'create') {
      this.loading = true;
      this.employeesService.createHoliday(formData).subscribe(
        (data) => {
          if (data) {
            this.loading = false;
            this.toastService.showSuccess('Holiday Added Successfully');
            this.routingService.handleRoute('holidays', null);
          }
        },
        (error: any) => {
          this.loading = false;
          console.log(error);
          this.toastService.showError(error);
        }
      );
    } else if (this.actionType == 'update') {
      this.loading = true;
      console.log(formData);
      this.employeesService.updateHoliday(this.holidayId, formData).subscribe(
        (data) => {
          if (data) {
            this.loading = false;
            this.toastService.showSuccess('Holiday Updated Successfully');
            this.routingService.handleRoute('holidays', null);
          }
        },
        (error: any) => {
          this.loading = false;
          this.toastService.showError(error);
        }
      );
    }
  }
  getHolidayById(filter = {}) {
    return new Promise((resolve, reject) => {
      this.loading = true;
      this.employeesService.getHolidayById(this.holidayId, filter).subscribe(
        (response) => {
          this.holidayData = response;
          this.loading = false;
          resolve(true);
        },
        (error: any) => {
          this.loading = false;
          resolve(false);
          this.toastService.showError(error);
        }
      );
    });
  }
  goBack() {
    this.location.back();
  }
}

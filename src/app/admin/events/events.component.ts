import { Component, OnInit } from '@angular/core';
import timeGridPlugin from '@fullcalendar/timegrid';
import { Location } from '@angular/common';
import { CalendarOptions } from '@fullcalendar/core';
import interactionPlugin from '@fullcalendar/interaction';
import dayGridPlugin from '@fullcalendar/daygrid';
import { projectConstantsLocal } from 'src/app/constants/project-constants';
import { ToastService } from 'src/app/services/toast.service';
import { EmployeesService } from '../employees/employees.service';

@Component({
  selector: 'app-events',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.scss'],
})
export class EventsComponent implements OnInit {
  breadCrumbItems: any = [];
  birthdayEvents: any = [];
  loading: boolean = false;
  version = projectConstantsLocal.VERSION_DESKTOP;
  employees: any[];
  interviews: any[];
  calendarOptions: CalendarOptions;
  currentYear: number;
  constructor(
    private location: Location,
    private toastService: ToastService,
    private employeesService: EmployeesService
  ) {
    this.breadCrumbItems = [
      {
        icon: 'fa fa-house',
        label: '  Dashboard',
        routerLink: '/user/dashboard',
        queryParams: { v: this.version },
      },
      { label: 'Events' },
    ];
  }

  ngOnInit(): void {
    this.currentYear = this.employeesService.getCurrentYear();
    Promise.all([this.getEmployees(), this.getInterviews()])
      .then(() => {
        this.setBirthdays();
      })
      .catch((error) => {
        console.error('Error loading data:', error);
      });
  }

  getEmployees(filter = {}) {
    return new Promise((resolve, reject) => {
      this.loading = true;
      filter['employeeInternalStatus-eq'] = 1;
      this.employeesService.getEmployees(filter).subscribe(
        (response: any) => {
          this.employees = response;
          this.employees = this.employees.map((emp) => ({
            ...emp,
            employeeName: emp.employeeName
              .split(' ')
              .map((word) => {
                if (word.includes('.')) {
                  return word
                    .split('.')
                    .map(
                      (part) =>
                        part.charAt(0).toUpperCase() +
                        part.slice(1).toLowerCase()
                    )
                    .join('.');
                }
                return (
                  word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                );
              })
              .join(' '),
          }));
          console.log(this.employees);
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

  getInterviews(filter = {}) {
    return new Promise((resolve, reject) => {
      this.loading = true;
      filter['interviewInternalStatus-eq'] = 1;
      this.employeesService.getInterviews(filter).subscribe(
        (response: any) => {
          this.interviews = response;
          this.interviews = this.interviews.map((interview) => ({
            ...interview,
            candidateName: interview.candidateName
              .split(' ')
              .map((word) => {
                if (word.includes('.')) {
                  return word
                    .split('.')
                    .map(
                      (part) =>
                        part.charAt(0).toUpperCase() +
                        part.slice(1).toLowerCase()
                    )
                    .join('.');
                }
                return (
                  word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                );
              })
              .join(' '),
          }));
          this.loading = false;
          console.log(this.interviews);
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
  setBirthdays() {
    if (this.employees && this.employees.length > 0) {
      this.birthdayEvents = [];
      const currentYear = new Date().getFullYear();
      const yearsToDisplay = [currentYear - 1, currentYear, currentYear + 1];
      yearsToDisplay.forEach((year) => {
        this.employees.forEach((employee) => {
          const dateOfBirth = new Date(employee.dateOfBirth);
          const birthdayDate = new Date(
            year,
            dateOfBirth.getMonth(),
            dateOfBirth.getDate()
          );
          this.birthdayEvents.push({
            title: `${employee.employeeName}'s Birthday 🎂`,
            date: `${birthdayDate.getFullYear()}-${(
              '0' +
              (birthdayDate.getMonth() + 1)
            ).slice(-2)}-${('0' + birthdayDate.getDate()).slice(-2)}`,
            description: `Celebrate ${employee.employeeName}'s birthday! 🎉🎉🎉`,
            color: 'purple',
          });
        });
      });
      const interviewEvents = this.interviews
        .filter((employee) => employee.scheduledDate)
        .map((employee) => {
          const scheduledDate = new Date(employee.scheduledDate);
          return {
            title: `${employee.candidateName}'s Interview `,
            date: `${scheduledDate.getFullYear()}-${(
              '0' +
              (scheduledDate.getMonth() + 1)
            ).slice(-2)}-${('0' + scheduledDate.getDate()).slice(-2)}`,
            description: `Interview scheduled for ${employee.candidateName}`,
            color: '#33009C',
          };
        });
      this.birthdayEvents = [...this.birthdayEvents, ...interviewEvents];
      console.log(this.birthdayEvents);
      this.calendarOptions = {
        plugins: [interactionPlugin, dayGridPlugin, timeGridPlugin],
        initialView: 'dayGridMonth',
        headerToolbar: {
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        },
        editable: true,
        selectable: true,
        events: this.birthdayEvents,
        dateClick: this.handleDateClick.bind(this),
        eventClick: this.handleEventClick.bind(this),
      };
    } else {
      console.log('No employees found.');
    }
  }

  handleDateClick(arg: any) {
    this.toastService.showInfo(`${arg.dateStr}`);
    // alert(`Date clicked: ${arg.dateStr}`);
  }

  handleEventClick(info: any) {
    // alert(`Event clicked: ${info.event.title}`);
    console.log(info.event);
    this.toastService.showInfo(`${info.event.extendedProps.description}`);
  }

  goBack() {
    this.location.back();
  }
}

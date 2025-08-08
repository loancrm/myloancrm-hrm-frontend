import { Component, Input, OnInit } from '@angular/core';
import { Output, EventEmitter } from '@angular/core';
import { DateTimeProcessorService } from '../services/date-time-processor.service';

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss'],
})
export class FilterComponent {
  @Input() position;
  @Input() filterConfig;
  @Input() iconSize;
  @Input() iconColor;
  @Input() showFilterIndication;
  @Input() isListViewSelected;
  showIndicationIcon: any = false;
  sidebarVisible: any;
  filter: any = {};
  @Output() filterEvent = new EventEmitter<any>();
  moment: any;
  accordionState: boolean[] = [];
  expandedAccordions: boolean[] = [];
  separateDialCode = true;

  constructor(DateTimeProcessorService: DateTimeProcessorService) {
    this.moment = DateTimeProcessorService.getMoment();
  }

  ngOnInit(): void {
    if (
      this.filterConfig &&
      this.filterConfig.length > 0 &&
      !this.showFilterIndication
    ) {
      this.filterConfig.forEach((element) => {
        element.data.forEach((data) => {
          this.filter[data.field + '-' + data.filterType] = '';
        });
      });
    }
    this.filterConfig.forEach(() => this.accordionState.push(false));
  }

  isAccordionExpanded(index: number): boolean {
    return this.accordionState[index];
  }

  toggleAccordion(index: number) {
    this.expandedAccordions[index] = !this.expandedAccordions[index];
  }

  resetFilters() {
    if (this.filterConfig && this.filterConfig.length > 0) {
      this.filterConfig.forEach((element) => {
        element.data.forEach((data) => {
          this.filter[data.field + '-' + data.filterType] = '';
        });
      });
    }
    let api_filter = {};
    api_filter['from'] = 0;
    api_filter['count'] = 10;
    api_filter['reset'] = true;
    console.log('this.filterConfig', api_filter);
    this.filterEvent.emit(api_filter);
  }

  ngOnChanges(changes) {
    if (this.showFilterIndication) {
      if (
        changes['showFilterIndication'] &&
        changes['showFilterIndication']['firstChange']
      ) {
        this.filter = this.showFilterIndication;
        if (this.filter['phoneNo-like'] === null) {
          delete this.filter['phoneNo-like'];
        }
      }
      if (
        Object.keys(this.showFilterIndication).length > 2 ||
        (Object.keys(this.showFilterIndication).length == 1 &&
          !(
            this.showFilterIndication['apptStatus-eq'] ||
            this.showFilterIndication['waitlistStatus-eq']
          ))
      ) {
        this.showIndicationIcon = true;
      } else {
        if (
          Object.keys(this.showFilterIndication).length == 2 &&
          !this.showFilterIndication['from'] &&
          !this.showFilterIndication['count']
        ) {
          this.showIndicationIcon = true;
        } else {
          this.showIndicationIcon = false;
        }
      }
    }
  }

  applyFilters() {
    let api_filter = {};
    this.filterConfig.forEach((element) => {
      element.data.forEach((data) => {
        if (
          this.filter[data.field + '-' + data.filterType] &&
          this.filter[data.field + '-' + data.filterType] != ''
        ) {
          // if (data.type == 'date') {
          //   api_filter[data.field + '-' + data.filterType] = this.moment(
          //     this.filter[data.field + '-' + data.filterType]
          //   ).format('YYYY-MM-DD');
          // }
          if (data.type == 'date') {
            if (data.field == 'createdOn' && data.filterType == 'like') {
              api_filter[data.field + '-' + data.filterType] = this.moment(
                this.filter[data.field + '-' + data.filterType]
              ).format('YYYY-MM-DD');
            } else {
              if (data.field == 'createdOn' && data.filterType == 'lte') {
                api_filter[data.field + '-' + data.filterType] = this.moment(
                  this.filter[data.field + '-' + data.filterType]
                )
                  .add(1, 'days')
                  .format('YYYY-MM-DD');
              } else if (
                data.field == 'createdOn' &&
                data.filterType == 'gte'
              ) {
                api_filter[data.field + '-' + data.filterType] = this.moment(
                  this.filter[data.field + '-' + data.filterType]
                ).format('YYYY-MM-DD');
              } else {
                api_filter[data.field + '-' + data.filterType] = this.moment(
                  this.filter[data.field + '-' + data.filterType]
                ).format('YYYY-MM-DD');
              }
            }
          } else if (data.type == 'multiselect') {
            if (data.suffix) {
              let finalValue = '';
              this.filter[data.field + '-' + data.filterType].forEach(
                (elementArrayData: any, index, array) => {
                  const isLastIndex = index === array.length - 1;
                  finalValue = finalValue + elementArrayData + data.suffix;
                  if (!isLastIndex && data.separator) {
                    finalValue = finalValue + data.separator;
                  }
                }
              );
              api_filter[data.field + '-' + data.filterType] = finalValue;
            } else {
              api_filter[data.field + '-' + data.filterType] =
                this.filter[data.field + '-' + data.filterType].toString();
            }
          } else if (data.type == 'phone') {
            let phoneNumber = this.filter[data.field + '-' + data.filterType];
            if (
              phoneNumber &&
              phoneNumber.dialCode &&
              phoneNumber.e164Number &&
              phoneNumber.e164Number.split(phoneNumber.dialCode)[1]
            ) {
              api_filter['countryCode-eq'] = phoneNumber.dialCode;
              api_filter[data.field + '-' + data.filterType] =
                phoneNumber.e164Number.split(phoneNumber.dialCode)[1];
            }
          } else if (data.type == 'month') {
            api_filter[data.field + '-' + data.filterType] = this.moment(
              this.filter[data.field + '-' + data.filterType]
            ).format('YYYY-MM');
          } else {
            if (data.prefix) {
              api_filter[data.field + '-' + data.filterType] =
                data.prefix + this.filter[data.field + '-' + data.filterType];
            } else {
              api_filter[data.field + '-' + data.filterType] =
                this.filter[data.field + '-' + data.filterType];
            }
          }
        }
      });
    });
    console.log(api_filter);
    if (Object.keys(api_filter).length == 0) {
      if (this.isListViewSelected) {
        api_filter['from'] = 0;
        api_filter['count'] = 10;
      }
      api_filter['reset'] = true;
    }
    this.filterEvent.emit(api_filter);
    this.sidebarVisible = false;
  }
}

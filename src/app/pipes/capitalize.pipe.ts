import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'capitalizeFirst', standalone: true })
export class CapitalizeFirstPipe implements PipeTransform {
  transform(value: string): string {
    if (value !== null && value !== undefined) {
      value = value.toString().trim();
      return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
    }
    return '';
  }
}
@Pipe({ name: 'uppercasePipe', standalone: true })
export class UppercasePipe implements PipeTransform {
  transform(value: string): string {
    return value ? value.toUpperCase() : '';
  }
}
@Pipe({ name: 'roundOff', standalone: true })
export class RoundOffPipe implements PipeTransform {
  transform(value: number): number {
    return Math.round(value);
  }
}

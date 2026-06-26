import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'utcToLocal',
  standalone: true,
})
export class UtcToLocalPipe implements PipeTransform {
  transform(value: string | Date | null | undefined): Date | null {
    if (!value) return null;
    const date =
      typeof value === 'string' && !value.endsWith('Z') ? new Date(value + 'Z') : new Date(value);

    return isNaN(date.getTime()) ? null : date;
  }
}

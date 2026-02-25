import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'aqiColor',
    standalone: true
})
export class AqiColorPipe implements PipeTransform {
    transform(value: number): string {
        if (value === null || value === undefined) return '#999999';
        if (value <= 50) return '#00E400'; // Tốt (Xanh lá)
        if (value <= 100) return '#FFFF00'; // Trung bình (Vàng)
        if (value <= 150) return '#FF7E00'; // Kém (Cam)
        if (value <= 200) return '#FF0000'; // Xấu (Đỏ)
        if (value <= 300) return '#8F3F97'; // Rất xấu (Tím)
        return '#7E0023'; // Nguy hiểm (Nâu đỏ)
    }
}

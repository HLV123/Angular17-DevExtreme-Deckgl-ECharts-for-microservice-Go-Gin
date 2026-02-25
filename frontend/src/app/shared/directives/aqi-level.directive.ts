import { Directive, ElementRef, Input, OnChanges, Renderer2 } from '@angular/core';
import { getAqiColor } from '../../core/mock-data';

@Directive({ selector: '[appAqiLevel]', standalone: true })
export class AqiLevelDirective implements OnChanges {
  @Input() appAqiLevel: number = 0;
  @Input() aqiProperty: 'color' | 'background' | 'borderLeft' = 'color';
  constructor(private el: ElementRef, private renderer: Renderer2) {}
  ngOnChanges() {
    const color = getAqiColor(this.appAqiLevel);
    switch (this.aqiProperty) {
      case 'color': this.renderer.setStyle(this.el.nativeElement, 'color', color); break;
      case 'background': this.renderer.setStyle(this.el.nativeElement, 'background', color + '20'); break;
      case 'borderLeft': this.renderer.setStyle(this.el.nativeElement, 'borderLeft', `3px solid ${color}`); break;
    }
  }
}

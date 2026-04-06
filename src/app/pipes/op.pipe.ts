import { Pipe, PipeTransform } from '@angular/core';

type Operation = 'convert' | 'compare' | 'add' | 'subtract' | 'divide';

interface OpDef { id: Operation; label: string; icon: string; description: string; }

@Pipe({ name: 'opFind', standalone: true })
export class OpFindPipe implements PipeTransform {
  transform(ops: OpDef[], id: Operation): string {
    return ops.find(o => o.id === id)?.label ?? '';
  }
}

@Pipe({ name: 'opSymbol', standalone: true })
export class OpSymbolPipe implements PipeTransform {
  transform(ops: OpDef[], id: Operation): string {
    return ops.find(o => o.id === id)?.icon ?? '';
  }
}

import { expect,it } from 'vitest';
import { speechText } from './speechText';
it('reads quantities and ordered symbols without changing their values',()=>{
 expect(speechText('4 + 2 = 6','en')).toBe('4 plus 2 equals 6');
 expect(speechText('8 - 5 = 3','es-MX')).toBe('8 menos 5 es igual a 3');
 expect(speechText('○ → △ → □','es-MX')).toBe('círculo después triángulo después cuadrado');
 expect(speechText('● ● ●','en')).toBe('dot dot dot');
});
it('does not turn hyphenated instructional words into subtraction',()=>{
 expect(speechText('Choose a four-step plan. 8 - 5 = 3','en')).toBe('Choose a four-step plan. 8 minus 5 equals 3');
});

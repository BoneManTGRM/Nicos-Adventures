/** Opening ramp anchors stay fixed. A level middle teaches sky attacks.
 * The combined gauntlet adds a safe runway between the existing ramp pair. */
export const SKY_STRETCH_START=4280,GAUNTLET_START=7880;
export function coursePosition(x:number):number|null{
 if(x>=SKY_STRETCH_START&&x<8480)return null;
 if(x<8480)return x;
 const q=x-8480,cell=Math.floor(q/2600),p=q%2600;
 return 280+cell*2000+(p<1090?p:p<1690?1090:p-600);
}
export function courseRamps(){return [815,1660,2815,3660,...Array.from({length:55},(_,i)=>8480+Math.floor(i/2)*2600+(i%2?1980:535))];}
export function rampArtPositions(left:number,right:number){return courseRamps().map(x=>x-45).filter(x=>x>=left-100&&x<=right+100);}

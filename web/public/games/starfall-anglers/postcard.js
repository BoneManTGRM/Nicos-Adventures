"use strict";
const CatchPostcard = (() => {
 async function loadArt(file){
  const img=new Image();img.src="assets/"+file+".png";await img.decode();return img;
 }
 async function make({fish,place,weight,rarity,language}){
  const [landscape,animal,bobber]=await Promise.all([loadArt(place.id),loadArt(fish.id),loadArt("brand")]);
  if(document.fonts)await document.fonts.load("40px Pineglass");
  const canvas=document.createElement("canvas");canvas.width=960;canvas.height=640;
  const c=canvas.getContext("2d");c.imageSmoothingEnabled=false;
  c.fillStyle="#f2e9cf";c.fillRect(0,0,960,640);
  const edge=24;c.drawImage(landscape,edge,edge,912,355);
  const wash=c.createLinearGradient(0,250,0,380);wash.addColorStop(0,"#13282b00");wash.addColorStop(1,"#10232dec");
  c.fillStyle=wash;c.fillRect(edge,250,912,130);
  c.fillStyle="#182e32";c.fillRect(40,39,278,48);
  c.drawImage(bobber,45,42,42,40);c.fillStyle="#ffe1a2";c.font="27px Pineglass, monospace";c.fillText("Starfall Anglers",94,71,210);
  c.fillStyle="#fff2c8";c.font="39px Pineglass, monospace";c.fillText(place.name[language],50,354,650);
  c.fillStyle="#243e3e";c.font="bold 20px system-ui";c.fillText((language?"REGISTRO DE PESCA":"CATCH RECORD")+"   /   NICO’S WORLD",48,432);
  c.font="49px Pineglass, monospace";c.fillText(fish.name[language],48,496,620);
  c.fillStyle="#45605a";c.font="bold 27px system-ui";c.fillText(rarity+"  ·  "+weight,49,543,620);
  c.strokeStyle="#b7ae8c";c.lineWidth=2;c.beginPath();c.moveTo(49,572);c.lineTo(909,572);c.stroke();
  c.font="19px system-ui";c.fillText(language?"Capturado y devuelto al agua":"Caught and released",49,607);
  c.save();c.translate(792,470);c.rotate(-.06);c.fillStyle="#decea4";c.fillRect(-113,-71,226,142);c.strokeStyle="#896f42";c.setLineDash([6,5]);c.strokeRect(-106,-64,212,128);const scale=Math.min(204/animal.naturalWidth,122/animal.naturalHeight),aw=animal.naturalWidth*scale,ah=animal.naturalHeight*scale;
  c.drawImage(animal,-aw/2,-ah/2,aw,ah);c.restore();
  return canvas.toDataURL("image/png");
 }
 return {make};
})();

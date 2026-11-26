// Near-street colors stay distinct from the softer painted skylines behind them.
function palette(sky,faces,glass,roads,trim,sign,neon,signs){
  return {sky,faces,glass,roads,trim,sign,neon,signs,
    sun:glass[3],light:glass[3],hills:[sky[2],sky[1],faces[3][1]],skyline:faces[4][1],
    skySide:roads[1],shore:roads[0],sea:sky[2],front:roads[2],edge:trim,outline:roads[2]};
}
export const expansionPalettes=[
  palette(['#594864','#a56267','#e99e65','#ffd697'],
    [['#dba55c','#915639'],['#e6b181','#945e54'],['#aa6a59','#633d4e'],['#cd7951','#7a4950'],['#dd985d','#93474c']],
    ['#293947','#4e5051','#69baaf','#ffdf8b'],['#78645c','#54444b','#362f3a'],'#f1ca8e','#a7443c','#59e0b6',['SOL','BARRO','ALBA','ÁMBAR','LUNA','PLAZA']),
  palette(['#161d47','#443c7e','#9a5488','#e8a177'],
    [['#ab525b','#602d4c'],['#516d91','#344565'],['#b77b70','#755270'],['#83577d','#4a3a60'],['#c48865','#784757']],
    ['#1d2c4e','#364967','#6ebfcb','#ffe1a4'],['#43425e','#302d47','#211e35'],'#e1b382','#ef6956','#66e0d5',['LUMA','BAO','FARO','LIN','NUBE','JADE']),
  palette(['#344654','#617367','#c9a765','#ead293'],
    [['#a58359','#64503e'],['#68918a','#415f65'],['#b79762','#766041'],['#9e7455','#615149'],['#ad985c','#635a42']],
    ['#233d43','#406364','#8bc4b1','#ffe1a0'],['#5e5d51','#424747','#2a343a'],'#e7c286','#ab5f39','#94e1c9',['TIC','BRASS','HORA','COBRE','METRO','CLAVE']),
  palette(['#4e9db6','#8aced2','#f6c6a4','#ffdfb1'],
    [['#ecac94','#a76d71'],['#83c7c4','#567d93'],['#ead687','#a89167'],['#e49896','#9e6976'],['#96c7ad','#578c88']],
    ['#23485d','#3a7386','#9bdddb','#ffe9a7'],['#748c91','#4b626e','#2a414e'],'#ffe4bd','#ed787d','#63e3cb',['MAR','OLA','PERLA','SAL','BAHÍA','ARRECIFE']),
  palette(['#25484c','#477c70','#83ab83','#d4d4a6'],
    [['#769976','#465954'],['#8cae9c','#526d71'],['#bf9770','#7b684f'],['#71937c','#486358'],['#a4b378','#677854']],
    ['#213f42','#41665f','#97c8ad','#fff0a0'],['#4d6358','#354d47','#253a3b'],'#dbd190','#be7954','#85edba',['HOJA','SAUCE','JARDÍN','LIANA','RAÍZ','LIRIO']),
  palette(['#151739','#382a65','#765787','#be90a9'],
    [['#8d92bb','#505878'],['#9cb0c5','#54687e'],['#bd91ab','#795b84'],['#8287b5','#4d5278'],['#b5a5c5','#736a95']],
    ['#242846','#404b6e','#85cedb','#fbeaab'],['#565775','#393d5b','#25283e'],'#dce2ea','#d282bd','#76ede5',['NOVA','ION','LUNA','VEGA','RELAY','ÓRBITA'])
];

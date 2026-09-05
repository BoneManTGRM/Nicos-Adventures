import type {NicoProfessionId} from '../types';
export const CLOSET_CATEGORIES=['all','favorites','adventure','helpers','creative','sports'] as const;
export const CATEGORY_NAMES={en:['All outfits','Favorites','Adventure','Everyday heroes','Creative','Sports'],'es-MX':['Todos','Favoritos','Aventura','Héroes cotidianos','Creativos','Deportes']} as const;
export const OUTFIT_GROUPS:Record<string,readonly NicoProfessionId[]>={adventure:['explorer','astronaut','dinosaur','pilot','detective','magician'],helpers:['doctor','scientist','engineer','builder','veterinarian','firefighter','teacher','dentist','police-officer','zookeeper','farmer','lifeguard','librarian'],creative:['suit','chef','artist','gardener','musician','magician'],sports:['soccer-player','tennis-player','lifeguard']};
export function toggleFavorite(favorites:readonly NicoProfessionId[],id:NicoProfessionId):NicoProfessionId[]{return favorites.includes(id)?favorites.filter(v=>v!==id):[...new Set([...favorites,id])].slice(0,26);}
export const STUDIO_BACKDROPS=['night','garden','sunset','paper'] as const;
export const BACKDROP_COLORS={night:['#0b1e3b','#314983'],garden:['#235e55','#a7c795'],sunset:['#9a546f','#efd3a0'],paper:['#efe4c8','#d8c5a3']} as const;

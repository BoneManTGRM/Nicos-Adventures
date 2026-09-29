import {useCallback} from 'react';
import {useAppStore} from '../app/AppStoreContext';
import {normalizeGames,type GarageSave,type KingdomSave} from './save';
export function useGameSave(){
 const {profile,commitProfile,saveState}=useAppStore(),id=profile.id;
 const garage=useCallback((change:(g:GarageSave)=>GarageSave)=>commitProfile(current=>{if(current.id!==id)return current;const games=normalizeGames(current.creativeGames);return {...current,creativeGames:{...games,garage:change(games.garage)}};}),[commitProfile,id]);
 const kingdom=useCallback((change:(k:KingdomSave)=>KingdomSave)=>commitProfile(current=>{if(current.id!==id)return current;const games=normalizeGames(current.creativeGames);return {...current,creativeGames:{...games,kingdom:change(games.kingdom)}};}),[commitProfile,id]);
 return {profile,saveState,games:normalizeGames(profile.creativeGames),setGarage:garage,setKingdom:kingdom};
}

"use client";
import {AccountStudy,AccountProgress} from "./AccountLearning";
export {ConnectedAccount} from "./ConnectedAuth";
// Legacy imports share the same account-backed screens as the canonical routes.
export function ConnectedLearning({study=false,level}:{study?:boolean;level?:string}){
 return study?<AccountStudy level={level}/>:<AccountProgress/>;
}
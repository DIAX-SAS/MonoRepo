import { PIMMState } from '@repo-hub/internal';

export function rotateArray(PIMMState: PIMMState, PIMMStates: PIMMState[]) {
  PIMMStates.shift();
  PIMMStates.push(PIMMState);
  return PIMMStates;
}

export function offsetArray(PIMMStates: PIMMState[]) {
  return PIMMStates;
}

export function extractStateArrays(){
    return [];
}

export function applyFilters(offset:boolean,stateVariables:[],originalData:PIMMState[]){
    const filteredObjects = {};
    return originalData;
}

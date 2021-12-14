import { atom } from 'recoil';

export const currentTrackIdState = atom({
    key: "currentTrackIdState", //unique ID
    default: '', //default / initial value
});

export const isPlayingState = atom({
    key: "isPlayingState", //unique ID
    default: false, //default / initial value
});
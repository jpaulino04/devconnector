//Actions alert.js
import uuid from 'uuid';
import {SET_ALERT, REMOVE_ALERT} from './types';

//dispatch more than one action type
//enabled by the thunk middleware (msng, alertType) => dispatch...
export const setAlert = (msg, alertType) => dispatch => {
    const id = uuid.v4();
    dispatch({
        type: SET_ALERT,
        payload: {msg, alertType, id}
    })
}
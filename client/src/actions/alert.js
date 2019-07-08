//Actions alert.js
import uuid from 'uuid';
import {SET_ALERT, REMOVE_ALERT} from './types';

//dispatch more than one action type
//enabled by the thunk middleware (msng, alertType) => dispatch...
export const setAlert = (msg, alertType) => dispatch => {
    const id = uuid.v4();
    //Dispatch the type of 'SET_ALERT' to the reducer and the alert will be added to the state.
    dispatch({
        type: SET_ALERT,
        payload: {msg, alertType, id}
    })
}

//Note that an alert component will interact with this
//The setAlert action will be called from the component
//Then the dispatch (alert reducer) will  be invoked
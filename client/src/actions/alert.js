//Actions alert.js
import uuid from 'uuid';
import {SET_ALERT, REMOVE_ALERT} from './types';

//You can call this function where you want to display the alert
//Notice that, when you call it, you will pass a message and an alertType
//dispatch more than one action type
//enabled by the thunk middleware (msng, alertType) => dispatch...
export const setAlert = (msg, alertType, timeout = 5000) => dispatch => {
    const id = uuid.v4();
    //Dispatch the type of 'SET_ALERT' to the reducer and the alert will be added to the state.
    dispatch({
        type: SET_ALERT,
        payload: {msg, alertType, id}
    });

    //Remove alert after 5 seconds
    setTimeout(() => dispatch({type: REMOVE_ALERT, payload: id},), timeout)
}

//Note that an alert component will interact with this
//The setAlert action will be called from the component
//Then the dispatch (alert reducer) will  be invoked
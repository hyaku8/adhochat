import Axios from 'axios'
import * as constants from './constants'



export const httpClient = Axios.create({
    baseUrl: "",
    timeout: 2000,
    headers: {
        'content-type': 'application/json; charset=utf-8'
    },
    transformRequest: [function (data, headers) {
        var userId = localStorage.getItem(constants.LOCALSTORAGE_USERID);
        if (userId)
            headers.common["x-adhochat-user-id"] = userId;
        console.log(data);
        return data;
    }]
});



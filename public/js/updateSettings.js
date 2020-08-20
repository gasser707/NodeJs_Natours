import axios from 'axios';
import { showAlert } from './alerts';
export const updateData = async (data, type) => {
    let url;
    if(type==='password'){
        url= '/api/v1/users/updatePassword'
    }else
    url=`/api/v1/users/updateMe`
    try {
        await axios({
            method: 'PATCH',
            url: url,
            data: data
        })
        showAlert('success', 'Updated!');
        location.reload()
    }catch(err){
        showAlert('error', err.response.data.message);

    }
};